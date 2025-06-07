import { TEST_DATA_DIRECTORY } from '../constants';

const tree = {
  path: `${TEST_DATA_DIRECTORY}`,
  name: 'test_data',
  type: 'directory',
  children: [
    {
      path: `${TEST_DATA_DIRECTORY}/file_a.txt`,
      name: 'file_a.txt',
      type: 'file',
      extension: '.txt',
    },
    {
      path: `${TEST_DATA_DIRECTORY}/file_b.txt`,
      name: 'file_b.txt',
      type: 'file',
      extension: '.txt',
    },
    {
      path: `${TEST_DATA_DIRECTORY}/some_dir`,
      name: 'some_dir',
      type: 'directory',
    },
    {
      path: `${TEST_DATA_DIRECTORY}/some_dir_2`,
      name: 'some_dir_2',
      type: 'directory',
    },
  ],
};
export default tree;
