import Dockerode from 'dockerode';
import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import { ContainerStats } from 'ssm-shared-lib/distribution/types/api';
import Container from '../model/Container';
import { ContainerStatModel } from '../model/ContainerStat';

async function create(container: Container, stats: Dockerode.ContainerStats) {
  const { cpu_stats, precpu_stats, memory_stats } = stats;
  const cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;

  const cpuSystemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;

  const memUsed = memory_stats.usage - (memory_stats.stats.cache || 0);
  const memAvailable = memory_stats.limit;
  await ContainerStatModel.create({
    container: container,
    cpuDelta: cpuDelta,
    cpuSystemDelta: cpuSystemDelta,
    memUsed: memUsed,
    memAvailable: memAvailable,
    memUsedPercentage: Math.round((memUsed / memAvailable) * 100.0),
    cpuUsedPercentage: Math.round((cpuDelta / cpuSystemDelta) * 100),
    raw: {
      numProcs: stats.num_procs,
      cpuUsageInUserMode: stats.cpu_stats?.cpu_usage.usage_in_usermode,
      cpuTotalUsage: stats.cpu_stats?.cpu_usage.total_usage,
      cpuUsageInKernelMode: stats.cpu_stats?.cpu_usage.usage_in_kernelmode,
      cpuSystemUsage: stats.cpu_stats?.system_cpu_usage,
      onlineCpus: stats.cpu_stats?.online_cpus,
      memMaxUsage: stats.memory_stats?.max_usage,
      memUsage: stats.memory_stats?.usage,
      memLimit: stats.memory_stats?.limit,
    },
  });
}

async function findStatByDeviceAndType(
  container: Container,
  type: string,
): Promise<[{ _id: string; value: number; createdAt: string; name: string }] | null> {
  const ObjectId = mongoose.Types.ObjectId;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return await ContainerStatModel.aggregate([
    {
      $match: { container: new ObjectId(container._id) },
    },
    {
      $sort: { createdAt: 1 },
    },
    {
      $group: {
        _id: '$container',
        value: { $last: `${type}` },
        date: { $last: '$createdAt' },
      },
    },
  ]).exec();
}

async function findStatsByDeviceAndType(
  container: Container,
  type: string,
  from: number,
): Promise<ContainerStats[] | null> {
  const ObjectId = mongoose.Types.ObjectId;
  return await ContainerStatModel.aggregate([
    {
      $match: {
        container: new ObjectId(container._id),
        createdAt: { $gt: DateTime.now().minus({ hour: from }).toJSDate() },
      },
    },
    {
      $project: {
        date: '$createdAt',
        value: `${type}`,
      },
    },
  ])
    .sort({ date: 1 })
    .exec();
}

export default {
  create,
  findStatByDeviceAndType,
  findStatsByDeviceAndType,
};
