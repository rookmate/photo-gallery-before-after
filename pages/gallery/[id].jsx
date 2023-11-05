import Image from 'next/image';
import styles from './[id].module.css';
const Dropbox = require('dropbox').Dropbox;
import axios from 'axios';

async function retrieveAccessToken() {
  // Instructions to get the refresh token: https://stackoverflow.com/a/74456272
  const postData = new URLSearchParams({
    refresh_token: process.env.NEXT_PUBLIC_DROPBOX_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });

  const base64authorization = Buffer.from(`${process.env.NEXT_PUBLIC_DROPBOX_APP_KEY}:${process.env.NEXT_PUBLIC_DROPBOX_APP_SECRET}`).toString('base64');
  const headers = {
    Authorization: `Basic ${base64authorization}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    // Make the POST request to retrieve the access token
    const response = await axios.post('https://api.dropbox.com/oauth2/token', postData.toString(), { headers });
    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    // Handle errors
    console.error('Error retrieving access token:', error.message);
    return null;
  }
}

async function fetchData() {
  // Retrieve the access token
  const accessToken = await retrieveAccessToken();

  if (!accessToken) {
    // Handle the case where access token retrieval fails
    return {
      photos: [],
      folderName: "",
    };
  }

  // Configure Dropbox with the retrieved access token
  const dbx = new Dropbox({ accessToken: accessToken });
  const photos = [];
  const folderName = "";

  try {
    // Fetch root folder list
    const folderList = await dbx.filesListFolder({ path: '' });

    if (folderList.result.entries && folderList.result.entries.length > 0) {
      for (const entry of folderList.result.entries) {
        if (entry['.tag'] === 'folder') {
          const folderName = entry.name;
          const searchResponse = await dbx.filesSearch({ path: '', query: entry.path_lower });
          if (searchResponse.result.matches && searchResponse.result.matches.length > 0) {
            for (const match of searchResponse.result.matches) {
              const metadata = match.metadata;
              if (metadata.name.split('.').slice(0, 1).join('.') === folderName) {
                if (metadata['.tag'] === 'file') {
                  let photoURL = "";
                  try {
                    const response = await dbx.sharingCreateSharedLinkWithSettings({ path: metadata.path_display });
                    photoURL = response.result.url;
                  } catch (error) {
                    if (error.status === 409) {
                      // Handle the case where the shared link already exists
                      photoURL = error.error.error.shared_link_already_exists.metadata.url;
                    } else {
                      console.error('Error creating shared link:', error);
                    }
                  }
                  photos.push({
                    name: metadata.name.split('.')[0],
                    url: photoURL.replace('dl=0', 'dl=1'),
                  });
                }
              }
            }
          } else {
            console.log('No matching files found for folder:', folderName);
          }
        }
      }
      console.log(photos);
    } else {
      console.log('No folders found in the root folder.');
    }

    return {
      photos,
      folderName,
    };
  } catch (error) {
    console.error('Error retrieving photos:', error);
    return {
      photos: [],
      folderName: "",
    };
  }
}

function HouseGallery({ photos, folderName }) {
  return (
    <div className={styles.imageGrid}>
      {photos.map((photo, index) => (
        <a href={`/gallery/before-and-after/${index}`} // Specify the dynamic route
          as={`/gallery/${folderName}/before-and-after/${index}`} // Define the actual URL
          key={index} className={styles.photo}
          >
          <Image
            src={photo.url}
            alt={photo.name}
            width={400}
            height={300}
            className={styles.image}
          />
          <p className={styles.textCentered}>{photo.name}</p>
        </a>
      ))}
    </div>
  );
}

export async function getServerSideProps({ params }) {
  // Fetch data using the fetchData function
  const { photos, folderName } = await fetchData();

  return {
    props: {
      photos,
      folderName,
    },
  };
}

export default HouseGallery;
