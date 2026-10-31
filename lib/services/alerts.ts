import type { ReportCategory } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type AlertFilters = {
  countryCode?: string;
  category?: ReportCategory;
  query?: string;
  from?: Date;
  to?: Date;
};

export async function listPublicAlerts(filters: AlertFilters) {
  const reviewedAt = filters.from || filters.to
    ? { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) }
    : undefined;

  return prisma.alert.findMany({
    where: {
      report: { is: { status: "REVIEWED" } },
      ...(filters.countryCode ? { countryCode: filters.countryCode } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(reviewedAt ? { reviewedAt } : {}),
      ...(filters.query ? {
        OR: [
          { title: { contains: filters.query, mode: "insensitive" } },
          { description: { contains: filters.query, mode: "insensitive" } },
        ],
      } : {}),
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      countryCode: true,
      safetyRecommendation: true,
      reviewedAt: true,
    },
    orderBy: { reviewedAt: "desc" },
    take: 50,
  });
}