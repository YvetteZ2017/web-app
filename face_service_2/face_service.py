import urllib
import re
import os
import json
import time

from matplotlib import pyplot as plt
from matplotlib.patches import Rectangle
from mtcnn.mtcnn import MTCNN
import numpy as np
from PIL import Image
from keras_vggface.utils import preprocess_input
from keras_vggface.vggface import VGGFace
from keras import backend as K
from scipy.spatial.distance import cosine
import boto3
from boto3.dynamodb.conditions import Key, Attr
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.python.keras import backend
from keras_vggface.vggface import VGGFace
import sagemaker
from sagemaker import get_execution_role
from sagemaker.tensorflow import TensorFlow
import tarfile
from sagemaker.tensorflow.serving import Model
from sagemaker.serializers import IdentitySerializer
# from sagemaker.deserializers import JSONDeserializer
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from multiprocessing import cpu_count
from tqdm.contrib.concurrent import process_map


url1 = 'https://dhei5unw3vrsx.cloudfront.net/images/source3_resized.jpg'
url2 = 'https://dhei5unw3vrsx.cloudfront.net/images/target3_resized.jpg'
url3 = 'https://dhei5unw3vrsx.cloudfront.net/images/target4_resized.jpg'


s3 = boto3.client('s3')
role = get_execution_role()
bucket = 'artworkfaces'
my_bucket = s3_resource.Bucket(bucket)
s3_resource = boto3.resource("s3")
dynamodb = boto3.resource('dynamodb')
dynamodb_client = boto3.client('dynamodb', region_name="us-east-1")
inputs_table = dynamodb.Table('inputs')
metadata_table = dynamodb.Table('metadata')
assets_table = dynamodb.Table('assets')


def find_faces(url1, url2):
    detector = MTCNN()
    highlight_faces(detector, url1)
    highlight_faces(detector, url2)
    extracted_face = extract_face_from_image(url2)
    for face in extracted_face:
        plt.imshow(face)
        plt.show()


def highlight_faces(detector, image_url):
    f = urllib.request.urlopen(image_url)
    image = plt.imread(f, format='jpg')
    plt.imshow(image)

    ax = plt.gca()

    faces = detector.detect_faces(image)
    for face in faces:
        x, y, width, height = face['box']
        face_border = Rectangle((x, y), width, height,
                                fill=False, color='red')
        ax.add_patch(face_border)
    plt.show()


def extract_face_from_image(image_url, required_size=(224, 224)):
    f = urllib.request.urlopen(image_url)
    image = plt.imread(f, format='jpg')
    detector = MTCNN()
    faces = detector.detect_faces(image)

    face_images = []

    for face in faces:
        x1, y1, width, height = face['box']
        x2, y2 = x1 + width, y1 + height

        face_boundary = image[y1:y2, x1:x2]

        face_image = Image.fromarray(face_boundary)
        face_image = face_image.resize(required_size)
        face_array = np.asarray(face_image)
        face_images.append(face_array)

    return np.array(face_images)


def get_model_scores(faces):
    samples = np.asarray(faces, 'float32')
    samples = preprocess_input(samples, version=2)

    model = VGGFace(model='resnet50',
                    include_top=False,
                    input_shape=(224, 224, 3),
                    pooling='avg')

    return model.predict(samples)


def get_face_distances(url1, url2, min_score):
    faces_from_image_2 = extract_face_from_image(url2)
    model_score_2 = get_model_scores(faces_from_image_2)
    match_score_1_2 = cosine(model_score_2[0], model_score_2[1])
    print(match_score_1_2)

    faces_from_image_1 = extract_face_from_image(url1)
    model_score_1 = get_model_scores(faces_from_image_1)
    for idx, face_score_1 in enumerate(model_score_2):
        for idy, face_score_2 in enumerate(model_score_1):
            score = cosine(face_score_1, face_score_2)
            if score <= min_score:
                print(idx, idy, score)
                plt.imshow(faces_from_image_2[idx])
                plt.show()
                plt.imshow(faces_from_image_1[idy])
                plt.show()


def save_face_model():
    backend.set_image_data_format('channels_first')
    model = VGGFace(model='resnet50',
                    include_top=False,
                    input_shape=(224, 224, 3),
                    pooling='avg')
    sess = K.get_session()
    face_model_path = 'export/face_model/1/'
    tf.saved_model.simple_save(
        sess,
        face_model_path,
        inputs={'inputs': model.input},
        outputs={t.name: t for t in model.outputs})

"""
    command to save model
    !saved_model_cli show --dir ./export/face_model/4 --tag_set serve --signature_def serving_default
"""

model_name = 'saved_model'
export_dir = 'export/face_model/1' + model_name

def zip_face_model():
    with tarfile.open('model.tar.gz', mode='w:gz') as archive:
        archive.add('export', recursive=True)


def upload_face_model_to_s3():
    sagemaker_session = sagemaker.Session()
    inputs = sagemaker_session.upload_data(path='model.tar.gz', key_prefix='model')
    print(inputs)


def deploy_sagemaker_model():
    sagemaker_model = Model(entry_point='inference.py', model_data = 's3://' + sagemaker_session.default_bucket() + '/model/model.tar.gz',
                            role = role, framework_version='2.1.0', source_dir='./export/code/')

    predictor = sagemaker_model.deploy(initial_instance_count=1,
                                       instance_type='ml.m4.xlarge',
                                       serializer=IdentitySerializer(content_type="application/x-image"),
                                           deserializer=JSONDeserializer(),
                                       )


def get_predictions(predictor, payload):
    sm_client = boto3.client('sagemaker-runtime')
    ENDPOINT_NAME = predictor.endpoint
    return sm_client.invoke_endpoint(EndpointName=ENDPOINT_NAME,
                                     ContentType='application/x-image',
                                     Body=payload)


def extract_features(s3_uri):
    key = s3_uri.replace(f's3://{bucket}/', '')
    payload = s3.get_object(Bucket=bucket,Key=key)['Body'].read()
    try:
        response = get_predictions(payload)
    except:
        time.sleep(0.1)
        response = get_predictions(payload)

    del payload
    response_body = json.loads((response['Body'].read()))
    feature_lst = response_body['predictions'][0]

    return s3_uri, feature_lst


def init_elastic_search(es_host):
    region = 'us-east-1' # e.g. us-east-1
    service = 'es'
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

    es = Elasticsearch(
        hosts = [{'host': es_host, 'port': 443}],
        http_auth = awsauth,
        use_ssl = True,
        verify_certs = True,
        connection_class = RequestsHttpConnection
    )
    return es


def build_knn_index(es):
    knn_index = {
        "settings": {
            "index.knn": True
        },
        "mappings": {
            "properties": {
                "artwork_img_vector": {
                    "type": "knn_vector",
                    "dimension": 2048
                }
            }
        }
    }
    es.indices.create(index="idx_artwork",body=knn_index,ignore=400)
    es.indices.get(index="idx_artwork")


def es_import(es, i):
    es.index(index='idx_artwork',
             body={"artwork_img_vector": i[1],
                   "image": i[0]}
             )

def index_face_collection(bucket):
    workers = 2 * cpu_count()
    s3_keys = []
    kwargs = {'Bucket': bucket}
    while True:
        resp = s3.list_objects_v2(**kwargs)
        for obj in resp['Contents']:
            keys.append('s3://' + bucket + '/' + obj['Key'])
        try:
            kwargs['ContinuationToken'] = resp['NextContinuationToken']
        except KeyError:
            break
    result = process_map(extract_features, s3_keys, max_workers=workers)
    process_map(es_import, result, max_workers=workers)


def visual_search(es, k_neighbors, face_features):
    idx_name = 'idx_artwork'
    res = es.search(request_timeout=30, index=idx_name,
                    body={'size': k_neighbors,
                          'query': {'knn': {'artwork_img_vector': {'vector': face_features, 'k': k_neighbors}}}})

