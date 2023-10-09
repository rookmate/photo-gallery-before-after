import { useRouter } from 'next/router';
import styles from './[before-and-after].module.css'; // Import your CSS file
import { Dropbox } from 'dropbox';
import axios from 'axios'; 

// Comparison function to sort by name
function compareByName(a, b) {
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();

  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}

// Function to retrieve the access token
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
    const response = await axios.post('https://api.dropbox.com/oauth2/token', postData, { headers });
    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    // Handle errors
    console.error('Error:', error.message);
    return null;
  }
}

// Function to find files with the same name as their parent folder
async function getServerSideProps({ params }) {
  const folderSelected = params.folderName; // Get the folder name from URL params
  const beforeImages = [];
  const afterImages = [];

  // Retrieve the access token
  const ACCESS_TOKEN = await retrieveAccessToken();

  if (!ACCESS_TOKEN) {
    // Handle the case where access token retrieval fails
    return {
      props: {
        beforeImages: [],
        afterImages: [],
      },
    };
  }

  // Initialize Dropbox with the provided access token
  const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

  try {
    const response = await dbx.filesListFolder({ path: '/' + folderSelected });

    response.result.entries.forEach(function (entry) {
      if (entry['.tag'] === 'file') {
        if (entry.name.includes('after')) {
          afterImages.push(entry);
        }

        if (entry.name.includes('before')) {
          beforeImages.push(entry);
        }
      }
    });

    // Sort the images by name
    beforeImages.sort(compareByName);
    afterImages.sort(compareByName);

    return {
      props: {
        beforeImages,
        afterImages,
      },
    };
  } catch (error) {
    console.error('Dropbox API error:', error);

    return {
      props: {
        beforeImages: [],
        afterImages: [],
      },
    };
  }
}

function BeforeAndAfter({ beforeImages, afterImages }) {
  const router = useRouter();
  const { index } = router.query;

  // Ensure index is a valid number and within the array bounds
  const imageIndex = parseInt(index);
  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= beforeImages.length) {
    return <div>Invalid index</div>;
  }

  const beforeImage = beforeImages[imageIndex];
  const afterImage = afterImages[imageIndex];

  return (
    <div>
      {/* Your "before and after" content */}
      <h1>Before and After Image #{imageIndex}</h1>
      {/* Render a pair of images */}
      <div className={styles.imagePair}>
        <div className={styles.column}>
          <Image src={beforeImage.url} alt={beforeImage.name} />
        </div>
        <div className={styles.column}>
          <Image src={afterImage.url} alt={afterImage.name} />
        </div>
      </div>
      {/* Add your images and other content here */}
    </div>
  );
}

export { getServerSideProps };
export default BeforeAndAfter;