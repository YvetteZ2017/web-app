import boto3
import requests
import json


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


def load_objects(collection_id, bucket):
    dynamodb = boto3.resource('dynamodb')
    assets_table = dynamodb.Table('assets')
    metadata_table = dynamodb.Table('metadata')

    f = open('met_object.json')
    data = json.load(f)
    objects = data["objects"]
    object_ids = list(dict.fromkeys(objects))
    try:
        for o in object_ids:
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

    except Exception as e:
        print("## Uploading to S3 failed.")

    f.close()
    return
        

def main():
    bucket='artworkfaces'
    load_objects(bucket)


if __name__ == "__main__":
    main() 