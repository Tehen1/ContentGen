import React from 'react';

    export function Card({ children }: { children: React.ReactNode }) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
          {children}
        </div>
      );
    }

    export function CardContent({ children }: { children: React.ReactNode }) {
      return <div className="p-4">{children}</div>;
    }

    export function CardHeader({ children }: { children: React.ReactNode }) {
      return <div className="flex items-center justify-between mb-4">{children}</div>;
    }

    export function CardTitle({ children }: { children: React.ReactNode }) {
      return <h3 className="text-lg font-semibold">{children}</h3>;
    }

    export function CardDescription({ children }: { children: React.ReactNode }) {
      return <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>;
    }
