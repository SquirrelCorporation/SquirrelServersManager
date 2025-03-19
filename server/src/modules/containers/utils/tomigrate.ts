/**
 * Get the Docker Registry by name.
 * @param registryName
 */
export function getRegistry(registryName: string): Registry {
  const registryToReturn = Object.values(getRegistries()).find((e) => e.name === registryName);
  if (!registryToReturn) {
    throw new Error(
      `Unsupported Registry ${registryName} - (${JSON.stringify(Object.values(getRegistries()))}`,
    );
  }
  return registryToReturn;
}

/**
 * Prune old containers from the store.
 * @param newContainers
 * @param containersFromTheStore
 */
export function pruneOldContainers(
  newContainers: (Container | undefined)[] | undefined,
  containersFromTheStore: Container[] | null,
) {
  const containersToRemove = getOldContainers(newContainers, containersFromTheStore);
  containersToRemove.forEach((containerToRemove) => {
    void ContainerRepo.deleteContainerById(containerToRemove.id);
  });
}