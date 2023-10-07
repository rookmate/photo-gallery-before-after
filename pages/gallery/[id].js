import Image from 'next/image';
import styles from './[id].module.css';
const Dropbox = require('dropbox').Dropbox;

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_DROPBOX_API_KEY;
const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

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
  const { id } = params;
  const photos = [];

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
              if (metadata.name.split('.').slice(0, -1).join('.') === folderName) {
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
          } else {
            console.log('No matching files found for folder:', folderName);
          }
        }
      }
      console.log(photos);
      // Now, photos contains objects with name and URL properties for matching files.
    } else {
      console.log('No folders found in the root folder.');
    }

    return {
      props: {
        photos,
        folderName: id,
      },
    };
  } catch (error) {
    console.error('Error retrieving photos:', error);
    return {
      props: {
        photos: photos,
        folderName: "",
      },
    };
  }
}

export default HouseGallery;