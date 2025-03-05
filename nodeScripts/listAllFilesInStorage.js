import { firebase } from './shared/admin.js';

/**
 * Scans all files for viruses
 */
async function scanAllFiles() {

  // open the store bucket
  const bucket = firebase.storage().bucket(process.env.STORAGE_URL);

  // read all files
  const [files] = await bucket.getFiles({
    // 'prefix': '/exercises',
  });

  // output all filenames (paths)
  files.forEach((file) => {
    console.log(file.name);
  });

  return true;

}

const main = async () => {
  return await scanAllFiles();
};

main()
.then((result) => {
    console.log('Result', result);
    return process.exit();
})
.catch((error) => {
    console.error(error);
    process.exit();
});
