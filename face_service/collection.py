import boto3
import requests
from decimal import Decimal
import json

import met_objects


def create_collection(collection_id):

    client=boto3.client('rekognition')

    #Create a collection
    print('Creating collection:' + collection_id)
    response=client.create_collection(CollectionId=collection_id)
    print('Collection ARN: ' + response['CollectionArn'])
    print('Status code: ' + str(response['StatusCode']))
    print('Done...')


def list_collections():

    max_results=2
    
    client=boto3.client('rekognition')

    #Display all the collections
    print('Displaying collections...')
    response=client.list_collections(MaxResults=max_results)
    collection_count=0
    done=False
    
    while done==False:
        collections=response['CollectionIds']

        for collection in collections:
            print (collection)
            collection_count+=1
        if 'NextToken' in response:
            nextToken=response['NextToken']
            response=client.list_collections(NextToken=nextToken,MaxResults=max_results)
            
        else:
            done=True

    return collection_count
    

def add_faces_to_collection(bucket, file_name, collection_id):

    client=boto3.client('rekognition')

    response=client.index_faces(CollectionId=collection_id,
                                Image={'S3Object':{'Bucket':bucket,'Name':file_name}},
                                ExternalImageId=file_name,
                                MaxFaces=5,
                                QualityFilter="AUTO",
                                DetectionAttributes=['ALL'])

    return response['FaceRecords']


def delete_faces_from_collection(collection_id, faces):

    client=boto3.client('rekognition')

    response=client.delete_faces(CollectionId=collection_id,
                               FaceIds=faces)
    
    print(str(len(response['DeletedFaces'])) + ' faces deleted:') 							
    for faceId in response['DeletedFaces']:
         print (faceId)
    return len(response['DeletedFaces'])


def search(collection_id, bucket, fileName):
    threshold = 0
    maxFaces=2

    client=boto3.client('rekognition')
    response=client.search_faces_by_image(CollectionId=collection_id,
                                Image={'S3Object':{'Bucket':bucket,'Name':fileName}},
                                FaceMatchThreshold=threshold,
                                MaxFaces=maxFaces)
                                
    faceMatches=response['FaceMatches']
    print ('Matching faces')
    for match in faceMatches:
            print ('FaceId:' + match['Face']['FaceId'] + ' ImageId: ' + match['Face']['ImageId'])
            print ('Similarity: ' + "{:.2f}".format(match['Similarity']) + "%")
            print(match)


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


def list_collection_faces(collection_id):
    client=boto3.client('rekognition')
    response=client.list_faces(
        CollectionId=collection_id,
    )
    print(response['Faces'])


def load_objects(collection_id, bucket):
    dynamodb = boto3.resource('dynamodb')
    assets_table = dynamodb.Table('assets')
    metadata_table = dynamodb.Table('metadata')

    objects = met_objects.objects
    try:
        for o in objects:
            o_name = str(o)
            print("## object: " + o_name)
            o_url = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/' + o_name
            response = requests.get(o_url)
            o_data = response.json()

            o_image_url = o_data['primaryImageSmall']
            metadata_item = dict()
            metadata_item['image_id'] = o_name
            metadata_item['artist_name'] = o_data['artistDisplayName']
            metadata_item['artist_bio'] = o_data['artistDisplayBio']
            metadata_item['artist_nationality'] = o_data['artistNationality']
            metadata_item['repository'] = o_data['repository']
            metadata_item['medium'] = o_data['medium']
            metadata_item['objectDate'] = o_data['objectDate']
            metadata_item['title'] = o_data['title']
            metadata_item['image_url'] = o_image_url
            metadata_item['object_url'] = o_data['objectURL']

            metadata_table.put_item(Item=metadata_item)

            upload_to_s3_bucket(bucket, o_image_url, o_name)

            face_records = add_faces_to_collection(bucket, o_name, collection_id)
            
            for faceRecord in face_records:
                asset_item = dict()
                asset_item['id'] = faceRecord['Face']['FaceId']
                asset_item['image_id'] = faceRecord['Face']['ImageId']
                asset_item['external_image_id'] = faceRecord['Face']['ExternalImageId']
                asset_item['bounding_box'] = json.loads(json.dumps(faceRecord['Face']['BoundingBox']), parse_float=Decimal)
                assets_table.put_item(Item=asset_item)

    except Exception as e:
        print("## Uploading to S3 failed.")
        raise e 
    return
        

def main():
    collection_id='ArtWorkFacesCollection'
    # create_collection(collection_id)

    # collection_count=list_collections()
    # print("collections: " + str(collection_count))

    bucket='artworkfaces'
    # collection_id='ArtWorkFacesCollection'

    # bucket='userinputs'
    # photo='original.jpg'
    
    # indexed_faces_count=add_faces_to_collection(bucket, photo, collection_id)
    # print("Faces indexed count: " + str(indexed_faces_count))

    # faces=[]
    # faces_count=delete_faces_from_collection(collection_id, faces)
    # print("deleted faces count: " + str(faces_count))

    # search(collection_id, bucket, photo)

    # list_collection_faces(collection_id)

    # load_objects(collection_id, bucket)


if __name__ == "__main__":
    main() 