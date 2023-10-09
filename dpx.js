const Dropbox = require('dropbox').Dropbox;
const axios = require('axios');
require('dotenv').config();

// Make the POST request to retrieve the access token
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
    const response = await axios.post('https://api.dropbox.com/oauth2/token', postData.toString(), { headers });
    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    // Handle errors
    console.error('Error:', error.message);
    return null;
  }
}

async function main() {
  const ACCESS_TOKEN = await retrieveAccessToken();

  if (ACCESS_TOKEN) {
    const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
    //getCurrentAccount(dbx);
    //listRootFiles(dbx);

    //const folderPath = '/house1';
    //listFilesInFolder(dbx, folderPath);

    //findFilesWithMatchingNames(dbx);
    //sharedLink(dbx);
    findFilesWithBeforeAfter(dbx, 'house1');
  }
}

main();
//-----------------------------------------------------------------------------------------------//
function getCurrentAccount(dbx) {
  dbx.usersGetCurrentAccount()
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.error(error);
    });
}
//-----------------------------------------------------------------------------------------------//
function listRootFiles(dbx) {
  dbx.filesListFolder({path: ''})
    .then(function(response) {
      console.log(response.result.entries);
    })
    .catch(function(error) {
      console.error(error);
  });
}
//-----------------------------------------------------------------------------------------------//
// Function to list all files inside a folder
function listFilesInFolder(dbx, folderPath) {
  dbx.filesListFolder({ path: folderPath })
    .then(function (response) {
      response.result.entries.forEach(function (entry) {
        if (entry['.tag'] === 'file') {
          console.log('File:', entry.name);
        }
      });
    })
    .catch(function (error) {
      console.error('Dropbox API error:', error);
    });
}
//-----------------------------------------------------------------------------------------------//
// Function to find files with the same name as their parent folder
function findFilesWithMatchingNames(dbx) {
  dbx.filesListFolder({ path: '' })
    .then(function (response) {
      if (response.result.entries && response.result.entries.length > 0) {
        response.result.entries.forEach(function (entry) {
          if (entry['.tag'] === 'folder') {
            const folderName = entry.name;
            dbx.filesSearch({ path: '', query: entry.path_lower })
              .then(function (searchResponse) {
                if (searchResponse.result.matches && searchResponse.result.matches.length > 0) {
                  searchResponse.result.matches.forEach(function (match) {
                    const metadata = match.metadata;
                    if (metadata.name.split('.').slice(0, -1).join('.') === folderName) {
                      console.log('File in folder', folderName, 'with matching name:', metadata.name);
                      console.log(metadata);
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
      } else {
        console.log('No folders found in the root folder.');
      }
    })
    .catch(function (error) {
      console.error('Dropbox API error (list folder):', error);
    });
}
//-----------------------------------------------------------------------------------------------//
async function sharedLink(dbx) {
  var photoURL = "";

  await dbx.sharingCreateSharedLinkWithSettings({ path: "/house3/house3.png" })
    .then((response) => {
      photoURL = response.result.url;
      console.log('Shared link URL:', photoURL);
    })
    .catch((error) => {
      if (error.status === 409) {
        // Handle the case where the shared link already exists
        photoURL = error.error.error.shared_link_already_exists.metadata.url;
        console.log('Shared link already exists. URL:', photoURL);
      } else {
        console.error('Error creating shared link:', error);
      }
    });
}
//-----------------------------------------------------------------------------------------------//
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

// Function to find files with the same name as their parent folder
async function findFilesWithBeforeAfter(dbx, folderSelected) {
  before = []
  after = []
  await dbx.filesListFolder({ path: '/'+folderSelected })
    .then(function (response) {
      response.result.entries.forEach(function (entry) {
        if (entry['.tag'] === 'file') {
          if (entry.name.includes('after')) {
            after.push(entry);
          }

          if (entry.name.includes('before')) {
            before.push(entry);
          }
        }
      });
      console.log(after.sort(compareByName))
      console.log(before.sort(compareByName))
    })
    .catch(function (error) {
      console.error('Dropbox API error:', error);
    });
}
//-----------------------------------------------------------------------------------------------//