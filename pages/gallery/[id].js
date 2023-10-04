import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from '../../components/Image';
import styles from './[id].module.css'; 

const Gallery = () => {
  const { id } = useRouter().query;

  const images = [
    {
      id: 1,
      src: '/images/house1/house1.png',
      alt: 'house1',
    },
    {
      id: 2,
      src: '/images/house2/house2.png',
      alt: 'house2',
    },
    {
      id: 3,
      src: '/images/house3/house3.png',
      alt: 'house3',
    },
    // Add more images as needed
  ];

  return (
    <div>
      <div className={styles.imageGrid}> {/* Use the CSS module for styling */}
        {images.map((image) => (
          <Link
            key={image.id}
            href={`/gallery/${id}/before-and-after/${image.id}`}
          >
              <Image src={image.src} alt={image.alt} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
