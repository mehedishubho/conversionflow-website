import { BaseRepository } from "@/shared/infrastructure/repositories";
import { licenseTransfers } from "@/lib/db/schema";
import { IMapper } from "@/shared/infrastructure/repositories/types";
import { eq, and, gte, sql, count, or } from "drizzle-orm";

// Transfer records are data objects, mapper is pass-through
class TransferMapper implements IMapper<any, any> {
  toDomain(data: any) { return data; }
  toData(entity: any) { return entity; }
}

export class TransferRepository extends BaseRepository<any, any> {
  constructor() {
    super(licenseTransfers, new TransferMapper());
  }

  async findByCode(code: string) {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(licenseTransfers.transferCode, code))
      .limit(1);
    return rows.length > 0 ? rows[0] : null;
  }

  async findPendingByLicenseId(licenseId: string) {
    return this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(licenseTransfers.licenseId, licenseId),
          eq(licenseTransfers.status, "pending"),
        )
      );
  }

  async findByUserId(userId: string) {
    return this.db
      .select()
      .from(this.table)
      .where(
        or(
          eq(licenseTransfers.fromUserId, userId),
          eq(licenseTransfers.toUserId, userId),
        )
      )
      .orderBy(sql`${licenseTransfers.createdAt} DESC`);
  }

  async countTransfersThisMonth(licenseId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.db
      .select({ count: count() })
      .from(this.table)
      .where(
        and(
          eq(licenseTransfers.licenseId, licenseId),
          or(
            eq(licenseTransfers.status, "completed"),
            eq(licenseTransfers.status, "pending"),
          ),
          gte(licenseTransfers.createdAt, startOfMonth),
        )
      );
    return result[0]?.count ?? 0;
  }
}
