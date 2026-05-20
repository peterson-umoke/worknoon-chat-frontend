'use client';

import { ConversationContext } from '../lib/types';
import { Package } from 'lucide-react';

export default function ProductContextCard({ context }: { context: ConversationContext }) {
  if (!context || (!context.productName && !context.orderId)) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-glass bg-bg-glass/80 px-4 py-2.5 backdrop-blur-sm">
      {context.productImage ? (
        <img
          src={context.productImage}
          alt={context.productName}
          className="h-10 w-10 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-secondary">
          <Package className="h-5 w-5 text-text-muted" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {context.productName || `Order #${context.orderId}`}
        </p>
        {context.productPrice && (
          <p className="text-text-secondary text-xs">{context.productPrice}</p>
        )}
      </div>
    </div>
  );
}
