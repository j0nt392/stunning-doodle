import boto3
import json
import os
from utils import Chord_classifier, Chord_preprocessing

chord_classifier = Chord_classifier()
chord_preprocessing = Chord_preprocessing()


def lambda_handler(event, context):
    # Assuming the event contains the S3 bucket name and object key
    s3_bucket = event['Records'][0]['s3']['bucket']['name']
    s3_object_key = event['Records'][0]['s3']['object']['key']

    s3_client = boto3.client('s3')

    # Download file from S3
    local_file_name = '/tmp/audio.wav'
    s3_client.download_file(s3_bucket, s3_object_key, local_file_name)

    # Here you would include your logic to process the audio file
    # For example, loading your machine learning model and making predictions
    # This part of the code will depend on your specific requirements and libraries

    # Mockup of your processing logic (replace with your actual logic)
    notes, chord = chord_classifier.predict_new_chord(local_file_name, 44100)
    chord = chord.tolist()

    data = {
        "notes": notes, 
        "chord": chord
    }

    # Return the response
    return {
        'statusCode': 200,
        'body': json.dumps(data)
    }
