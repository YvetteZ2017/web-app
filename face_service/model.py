import urllib
from matplotlib import pyplot as plt
from matplotlib.patches import Rectangle
from mtcnn.mtcnn import MTCNN
import numpy as np
from PIL import Image
from keras_vggface.utils import preprocess_input
from keras_vggface.vggface import VGGFace
from scipy.spatial.distance import cosine

url1 = 'https://dhei5unw3vrsx.cloudfront.net/images/source3_resized.jpg'
url2 = 'https://dhei5unw3vrsx.cloudfront.net/images/target3_resized.jpg'
url3 = 'https://dhei5unw3vrsx.cloudfront.net/images/target4_resized.jpg'


def highlight_faces(image_url):
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
        # extract the bounding box from the requested face
        x1, y1, width, height = face['box']
        x2, y2 = x1 + width, y1 + height

        # extract the face
        face_boundary = image[y1:y2, x1:x2]

        # resize pixels to the model size
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


highlight_faces(url1)
highlight_faces(url2)
extracted_face = extract_face_from_image(url2)
for face in extracted_face:
    plt.imshow(face)
    plt.show()

faces_from_image_2 = extract_face_from_image(url2)

model_score_2 = get_model_scores(faces_from_image_2)
match_score_1_2 = cosine(model_score_2[0], model_score_2[1])
print(match_score_1_2)

faces_from_image_1 = extract_face_from_image(url1)
model_score_1 = get_model_scores(faces_from_image_1)
for idx, face_score_1 in enumerate(model_score_2):
    for idy, face_score_2 in enumerate(model_score_1):
        score = cosine(face_score_1, face_score_2)
        if score <= 0.4:
            # Printing the IDs of faces and score
            print(idx, idy, score)
            # Displaying each matched pair of faces
            plt.imshow(faces_from_image_2[idx])
            plt.show()
            plt.imshow(faces_from_image_1[idy])
            plt.show()