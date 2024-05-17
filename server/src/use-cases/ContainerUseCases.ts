import Container from '../data/database/model/Container';
import ContainerRepo from '../data/database/repository/ContainerRepo';

async function updateCustomName(customName: string, container: Container): Promise<void> {
  container.customName = customName;
  await ContainerRepo.updateContainer(container);
}

export default {
  updateCustomName,
};
