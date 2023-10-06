import Image from 'next/image';
import styles from './[id].module.css';
const Dropbox = require('dropbox').Dropbox;

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_DROPBOX_API_KEY;
const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

function HouseGallery({ photos, folderName }) {
  return (
    <div className={styles.gallery}>
      <h1>{`Photos in Folder: ${folderName}`}</h1>
      <div className={styles.photoContainer}>
        {photos.map((photo, index) => (
          <div key={index} className={styles.photo}>
            <Image src={photo.url} alt={`Image ${index}`} width={400} height={300} />
            <p>{photo.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const folderName = "house1"; // Assuming the folder name matches the [id] parameter
    console.log(folderName)
    // Fetch root folder list
    const response = await dbx.filesListFolder({ path: '' });
    console.log(response.result.entries)

    if (response.result.entries && response.result.entries.length > 0) {
      const photos = []; // Initialize an empty array to store photo/url objects

      response.result.entries.forEach(function (entry) {
        if (entry['.tag'] === 'folder') {
          const folderName = entry.name;
          dbx.filesSearch({ path: '', query: entry.path_lower })
            .then(function (searchResponse) {
              if (searchResponse.result.matches && searchResponse.result.matches.length > 0) {
                searchResponse.result.matches.forEach(function (match) {
                  const metadata = match.metadata;
                  if (metadata.name.split('.').slice(0, -1).join('.') === folderName) {
                    photos.push({
                      name: metadata.name,
                      url: `https://www.dropbox.com/s/${metadata.id}/${metadata.name}?dl=1`,
                    });
                    console.log(photos)
                  }
                });
              } else {
                console.log('No matching files found for folder:', folderName);
              }
            })
            .catch(function (error) {
              console.error('Dropbox API error (search):', error);
            });
        }
      });

      // Now, photos contains objects with name and URL properties for matching files.
    } else {
      console.log('No folders found in the root folder.');
    }

    return {
      props: {
        photos,
        folderName,
      },
    };
  } catch (error) {
    console.error('Error retrieving photos:', error);
    return {
      props: {
        photos: [], // Handle errors gracefully
        folderName: id,
      },
    };
  }
}

export default HouseGallery;