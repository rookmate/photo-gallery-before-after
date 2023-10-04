import Image from '../../../../components/Image';
import { useRouter } from 'next/router';
import styles from './[before-and-after].module.css';

const SubGallery = ({ subGalleryId }) => {
  // Create an array of "before and after" images related to the clicked image
  const beforeAndAfterImages = [
    {
      srcBefore: '/images/house1/before1.png',
      srcAfter: '/images/house1/after1.png',
      alt: 'Image 1 - Before and After',
    },
    {
      srcBefore: '/images/house1/before2.png',
      srcAfter: '/images/house1/after2.png',
      alt: 'Image 2 - Before and After',
    },
    // Add more "before and after" images as needed
  ];

  return (
    <div>
      <h2>Sub-Gallery {subGalleryId}</h2>
      <div className={styles.imageGrid}>
        {beforeAndAfterImages.map((image, index) => (
          <div key={index} className={styles.imagePair}>
            <h3>{image.alt}</h3>
            <div className={styles.column}>
              <div className="column">
                <Image src={image.srcBefore} alt={`Before ${image.alt}`} />
              </div>
              <div className="column">
                <Image src={image.srcAfter} alt={`After ${image.alt}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubGallery;