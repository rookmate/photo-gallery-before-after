import Image from 'next/image';

function HousePhoto({ photo }) {
  return (
    <div>
      <Image
        src={`https://content.dropboxapi.com/2/files/download${photo.path_display}`}
        alt={photo.name}
        width={400}
        height={300}
      />
    </div>
  );
}

export default HousePhoto;