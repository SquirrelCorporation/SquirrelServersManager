import { TEST_DATA_DIRECTORY } from './constants';

const tree = {
  path: `${TEST_DATA_DIRECTORY}`,
  name: 'test_data',
  children: [
    {
      path: `${TEST_DATA_DIRECTORY}/file_a.txt`,
      name: 'file_a.txt',
      size: 12,
      extension: '.txt',
      type: 'file',
    },
    {
      path: `${TEST_DATA_DIRECTORY}/file_b.txt`,
      name: 'file_b.txt',
      size: 3756,
      extension: '.txt',
      type: 'file',
    },
    {
      path: `${TEST_DATA_DIRECTORY}/some_dir`,
      name: 'some_dir',
      children: [
        {
          path: `${TEST_DATA_DIRECTORY}/some_dir/file_a.txt`,
          name: 'file_a.txt',
          size: 12,
          extension: '.txt',
          type: 'file',
        },
        {
          path: `${TEST_DATA_DIRECTORY}/some_dir/file_b.txt`,
          name: 'file_b.txt',
          size: 3756,
          extension: '.txt',
          type: 'file',
        },
      ],
      type: 'directory',
      size: 3768,
    },
    {
      path: `${TEST_DATA_DIRECTORY}/some_dir_2`,
      name: 'some_dir_2',
      children: [
        {
          path: `${TEST_DATA_DIRECTORY}/some_dir_2/.gitkeep`,
          name: '.gitkeep',
          size: 0,
          extension: '',
          type: 'file',
        },
      ],
      size: 0,
      type: 'directory',
    },
  ],
  size: 7536,
  type: 'directory',
};

export default tree;
