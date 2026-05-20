'use client';

import { Role } from '../lib/types';

const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-role-admin/15 text-role-admin',
  agent: 'bg-role-agent/15 text-role-agent',
  customer: 'bg-role-customer/15 text-role-customer',
  designer: 'bg-role-designer/15 text-role-designer',
  merchant: 'bg-role-merchant/15 text-role-merchant',
};

export default function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-[10px] uppercase tracking-wide ${ROLE_COLORS[role]}`}>
      {role}
    </span>
  );
}
