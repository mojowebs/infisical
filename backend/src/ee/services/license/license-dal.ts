import { Knex } from "knex";

import { TDbClient } from "@app/db";
import { OrgMembershipStatus, TableName } from "@app/db/schemas";
import { DatabaseError } from "@app/lib/errors";

export type TLicenseDALFactory = ReturnType<typeof licenseDALFactory>;

export const licenseDALFactory = (db: TDbClient) => {
  const countOfOrgMembers = async (orgId: string | null, tx?: Knex) => {
    try {
      const doc = await (tx || db)(TableName.OrgMembership)
        .where({ status: OrgMembershipStatus.Accepted })
        .andWhere((bd) => {
          if (orgId) {
            void bd.where({ orgId });
          }
        })
        .join(TableName.Users, `${TableName.OrgMembership}.userId`, `${TableName.Users}.id`)
        .where(`${TableName.Users}.isGhost`, false)
        .count();
      return doc?.[0].count;
    } catch (error) {
      throw new DatabaseError({ error, name: "Count of Org Members" });
    }
  };

  return { countOfOrgMembers };
};
