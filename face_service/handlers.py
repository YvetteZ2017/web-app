import boto3
from boto3.dynamodb.conditions import Key, Attr
from flask-lambda import FlaskLambda
import os
import requests
import uuid
from decimal import Decimal
import json

app = FlaskLambda(__name__)

# input_bucket = os.environ['INPUT_BUCKET']
# collection_id = os.environ['COLLECTION_ID']
# threshold = os.environ['THRESHOLD']

input_bucket = 'userinputs'
collection_id='ArtWorkFacesCollection'
threshold = 0

maxFaces=1

dynamodb = boto3.resource('dynamodb')
dynamodb_client = boto3.client('dynamodb', region_name="us-east-1")
inputs_table = dynamodb.Table('inputs')
metadata_table = dynamodb.Table('metadata')

def upload_to_s3_bucket(bucket_name, url, file_name):
    try:
        s3 = boto3.resource('s3')
        req_for_image = requests.get(url, stream=True)
        file_object_from_req = req_for_image.raw
        req_data = file_object_from_req.read()

        s3.Bucket(bucket_name).put_object(Key=file_name, Body=req_data)
        return "Success"
    except Exception as e:
        print("## Uploading to S3 failed, object: " + file_name)
        raise e


def search(collection_id, bucket, fileName):
    client=boto3.client('rekognition')
    response=client.search_faces_by_image(CollectionId=collection_id,
                                Image={'S3Object':{'Bucket':bucket,'Name':fileName}},
                                FaceMatchThreshold=threshold,
                                MaxFaces=maxFaces)
                                
    return response['FaceMatches']


def my_handler(event, context):
    if event['type'] == 'add_input':
        return add_input_handler(event, context)
    elif event['type'] == 'get_input':
        return get_input_handler(event, context)
    elif event['type'] == 'delete_input':
        return delete_input_handler(event, context)
    elif event['type'] == 'hello':
        return hello_handler(event, context)
    elif event['type'] == 'list_inputs':
        return list_inputs_handler(event, context)
    return


def hello_handler(event, context):
    print("## context: ", context)
    message = 'Hello {} {}!'.format(event['first_name'], event['last_name'])  
    return { 
        'message' : message
    } 


def add_input_handler(event, context):
    inputs_table = dynamodb.Table('inputs')

    input_url = event['url']
    input_image_id = str(uuid.uuid4())
    print("## input_image_id:",  input_image_id)

    # user_id = context.identity.cognito_identity_id
    user_id = event['user_id']
    print("## user_id:",  user_id)

    input_s3_path = user_id + '/' + input_image_id
    upload_to_s3_bucket(input_bucket, input_url, input_s3_path)
    print("# searching faces...")
    face_matches = search(collection_id, input_bucket, input_s3_path)
    print("# puting item to inputs table...")
    for match in face_matches:
        input_item = {
            'id': input_image_id,
            'user_id': user_id,
            'match_face_id': match['Face']['FaceId'],
            'match_image_id': match['Face']['ExternalImageId'],
            'bounding_box': json.loads(json.dumps(match['Face']['BoundingBox']), parse_float=Decimal),
            'url': input_url
        }
        inputs_table.put_item(Item=input_item)
    return input_item


def delete_input_handler(event, context):
    print("# deleting item from inputs table...")
    inputs_table.delete_item(Key={'id': event['id']})
    
    # user_id = context.identity.cognito_identity_id
    user_id = event['user_id']
    print("## user_id:",  user_id)
    s3 = boto3.resource('s3')
    input_key = user_id + '/' + event['id']
    s3.Object(input_bucket, input_key).delete()


def get_input_handler(event, context):
    print("# getting item from inputs table...")
    # user_id = context.identity.cognito_identity_id
    user_id = event['user_id']
    print("## user_id:",  user_id)
    response = inputs_table.get_item(Key={'id': event['id']})

    if 'Item' in response:
        item = response['Item']
        match_image_url = 'https://artworkfaces.s3.amazonaws.com/' + item['match_image_id']
        input_image_url = 'https://userinputs.s3.amazonaws.com/' + item['user_id'] + '/' + item['id']
        item['match_image_url'] = match_image_url
        item['input_image_url'] = input_image_url

        response2 = metadata_table.get_item(Key={'image_id': item['match_image_id']})
        if 'Item' in response2:
            item['metadata'] = response2['Item']
        return item
    else:
        print('### no input in db')
    


def list_inputs_handler(event, context):
    print("# getting item from inputs table...")
    # user_id = context.identity.cognito_identity_id
    user_id = event['user_id']
    print("## user_id:",  user_id)
    
    response = inputs_table.scan(FilterExpression=Attr('user_id').eq(user_id))
    if 'Items' in response:
        inputs = response['Items'].copy()
        for item in response['Items']:
            i = dict()
            match_image_url = 'https://artworkfaces.s3.amazonaws.com/' + item['match_image_id']
            input_image_url = 'https://userinputs.s3.amazonaws.com/' + item['user_id'] + '/' + item['id']
            i['match_image_url'] = match_image_url
            i['input_image_url'] = input_image_url
            inputs.append(i)
        return inputs
    else:
        print('### found no inputs')

@app.route('/inputs', methods=['GET', 'POST'])
def foo():
    data = {
        'form': request.form.copy(),
        'args': request.args.copy(),
        'json': request.json
    }
    return (
        json.dumps(data, indent=4, sort_keys=True),
        200,
        {'Content-Type': 'application/json'}
    )

# def main():
#     event = {'user_id': 'test_user_id','id': '5c6381bc-f885-4928-946c-353eff0cf0f2'}
#     # event = {'url': 'https://www.saltwire.com/media/photologue/photos/cache/not-a-billionaire-but-kylie-jenner-is-highest-paid-celebrity-forbes-says_large'}
#     get_input_handler(event, None)

# if __name__ == "__main__":
#     main() 

if __name__ == '__main__':
    app.run(debug=True)