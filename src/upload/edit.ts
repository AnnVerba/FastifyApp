import { extname } from 'path';

export const editFileName = (req: any, file, callback) => {
  console.log('start edit name');
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  console.log('end edit name');
  callback(null, `${name}-${randomName}${fileExtName}`);
};
export const imageFileFilter = (req, file, callback) => {
  console.log('edit');
  if (!file.originalname.match(/\.(JPG|jpeg|png|gif|txt)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};
