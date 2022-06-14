import boto3
from boto3.dynamodb.conditions import Key, Attr
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from flask_lambda import FlaskLambda
from flask import request, abort
from io import BytesIO
import os
import requests
from urllib.parse import urlparse
import uuid
import base64
from decimal import Decimal
import simplejson as json

app = FlaskLambda(__name__)

region = os.environ['AWS_REGION']
input_bucket = os.environ['INPUT_BUCKET']
collection_id = os.environ['COLLECTION_ID']
threshold = os.environ['THRESHOLD']
elasticsearch_endpoint = os.environ['ES_ENDPOINT']
sagemaker_endpoint = os.environ['SM_ENDPOINT']
es_index_name = os.environ['ES_INDEX_NAME']
es_vector_name = os.environ['ES_VECTOR_NAME']


maxFaces=1

dynamodb = boto3.resource('dynamodb')
dynamodb_client = boto3.client('dynamodb', region_name="us-east-1")
inputs_table = dynamodb.Table('inputs')
metadata_table = dynamodb.Table('metadata')
sagemaker_client = boto3.client('sagemaker-runtime')

session = boto3.session.Session()
credentials = session.get_credentials()
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    'es',
    session_token=credentials.token
)

es = Elasticsearch(
    hosts=[{'host': elasticsearch_endpoint, 'port': 443}],
    http_auth=awsauth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)

s3 = boto3.resource('s3')

def upload_to_s3_bucket(bucket_name, url, file_name):
    try:
        req_for_image = requests.get(url, stream=True)
        file_object_from_req = req_for_image.raw
        req_data = file_object_from_req.read()

        s3.Bucket(bucket_name).put_object(Key=file_name, Body=req_data)
        return "Success"
    except Exception as e:
        print("## Uploading to S3 failed, object: " + file_name)
        raise e


def upload_base64_s3_bucket(bucket_name, image_base64_string, file_name):
    try:
        s3 = boto3.resource('s3')
        s3.Bucket(bucket_name).put_object(Key=file_name, Body=base64.b64decode(image_base64_string))
        return "Success"
    except Exception as e:
        print("## Uploading to S3 failed, object: " + file_name)
        raise e


def get_face_features(sagemaker_client, sagemaker_endpoint, img_bytes):
    response = sagemaker_client.invoke_endpoint(
        EndpointName=sagemaker_endpoint,
        ContentType='application/x-image',
        Body=img_bytes)
    response_body = json.loads((response['Body'].read()))
    features = response_body['predictions'][0]
    return features


def visual_search(features, es, k=3):
    face_matches = {}
    res = es.search(
        request_timeout=30, index=es_index_name,
        body={
            'size': k,
            'query': {'knn': {es_vector_name: {'vector': features, 'k': k}}}}
    )
    s3_uris = [res['hits']['hits'][x]['_source']['image'] for x in range(k)]
    for x in s3_uris:
        bucket = urlparse(x).netloc
        key = urlparse(x).path.lstrip('/')
        face_matches[key] = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': urlparse(x).netloc,
                'Key': key},
            ExpiresIn=300
        )
    return face_matches


def get_image_bytes(image_url):
    r = requests.get(image_url)
    if r.status_code == 200:
        image_bytes = BytesIO(r.content)
    else:
        print("image bytes failed to download")
    return image_bytes


@app.route('/inputs/<input_id>', methods=['DELETE'])
def delete_input_handler(input_id):
    print("# deleting item from inputs table...")
    inputs_table.delete_item(Key={'id': input_id})
    
    user_id = ''
    try:
        user_id = request.args.get('user_id')
    except Exception as e:
        print("## Failed getting userId: ", e)
    s3 = boto3.resource('s3')
    input_key = user_id + '/' + input_id
    s3.Object(input_bucket, input_key).delete()
    return (
        'Delete Succeed',
        200,
        {'Content-Type': 'application/json'}
    )


@app.route('/inputs/<input_id>', methods=['GET'])
def get_input_handler(input_id):
    print("# getting item from inputs table...")
    # user_id = context.identity.cognito_identity_id
    user_id = ''
    try:
        user_id = request.args.get('user_id')
    except Exception as e:
        print("## Failed getting userId: ", e)
    response = inputs_table.get_item(Key={'id': input_id})

    if 'Item' in response:
        item = response['Item']
        match_image_url = 'https://artworkfaces.s3.amazonaws.com/' + item['match_image_id']
        input_image_url = 'https://userinputs.s3.amazonaws.com/' + item['user_id'] + '/' + item['id']
        item['match_image_url'] = match_image_url
        item['input_image_url'] = input_image_url

        response2 = metadata_table.get_item(Key={'image_id': item['match_image_id']})
        if 'Item' in response2:
            item['metadata'] = response2['Item']
        return (
            json.dumps(item, indent=4, sort_keys=True, use_decimal=True),
            200,
            {'Content-Type': 'application/json'}
        )
    else:
        print('### no input in db')
        abort(404)


@app.route('/inputs', methods=['GET'])
def list_inputs():
    print("# request.args: ", request.args)
    try:
        user_id = request.args.get('user_id')
    except Exception as e:
        print("## Failed getting userId: ", e)

    print("# getting item from inputs table...")
    print("## user_id:",  user_id)
    
    response = inputs_table.scan(FilterExpression=Attr('user_id').eq(user_id))
    if 'Items' in response:
        inputs = []
        for item in response['Items']:
            match_image_url = 'https://artworkfaces.s3.amazonaws.com/' + item['match_image_id']
            input_image_url = 'https://userinputs.s3.amazonaws.com/' + item['user_id'] + '/' + item['id']
            item['match_image_url'] = match_image_url
            item['input_image_url'] = input_image_url
            inputs.append(item)
        return (
            json.dumps(inputs, indent=4, sort_keys=True, use_decimal=True),
            200,
            {
                'Content-Type': 'application/json',
            }
        )
    else:
        return (
            "Found no inputs.",
            200,
            {
                'Content-Type': 'application/json',
            }
        )


@app.route('/inputs', methods=['POST'])
def post_input():
    data = request.json
    inputs_table = dynamodb.Table('inputs')

    if 'user_id' not in data:
        return (
            'Invalid request: user_id not found.',
            400,
            {'Content-Type': 'application/json'}
        )
    user_id = data['user_id']
    print("## user_id:",  user_id)

    input_image_id = str(uuid.uuid4())
    input_s3_path = user_id + '/' + input_image_id
    input_url = ''
    image_bytes = None
    if 'url' in data:
        input_url = data['url']
        print("## input_image_id:",  input_image_id)
        upload_to_s3_bucket(input_bucket, input_url, input_s3_path)
        image_bytes = get_image_bytes(input_url)
    elif 'base64' in data:
        image_base64 = data['base64']
        upload_base64_s3_bucket(input_bucket, image_base64, input_s3_path)
        image_bytes = BytesIO(base64.b64decode(image_base64))

    k = data['k']
    print("# searching faces...")
    face_features = get_face_features(sagemaker_client, sagemaker_endpoint, image_bytes)
    face_matches = visual_search(face_features, es, k=k)
    print("# putting item to inputs table...")
    for match in face_matches:
        input_item = {
            'id': input_image_id,
            'user_id': user_id,
            'match_image_id': match['match_image_id'],
            'bounding_box': json.loads(json.dumps(match['Face']['BoundingBox']), use_decimal=True),
            'url': input_url
        }
        inputs_table.put_item(Item=input_item)
    return (
        json.dumps(input_item, indent=4, sort_keys=True),
        200,
        {'Content-Type': 'application/json'}
    )


@app.route('/hello', methods=['GET'])
def test_hello():
    data = {
        'req': request,
        'message': 'hello'
    }
    return (
        json.dumps(data, indent=4, sort_keys=True),
        200,
        {'Content-Type': 'application/json'}
    )

if __name__ == '__main__':
    app.run(debug=True)