import React from 'react';
import style from './osloUsedGadgetTable.module.css';

type UsedGadgetPurchaseRow = {
  year: string;
  newPurchases: number | null;
  usedPurchases: number | null;
};

const usedGadgetPurchaseData = [
  {
    year: '2025',
    newPurchases: 77,
    usedPurchases: 5,
  },
  {
    year: '2024',
    newPurchases: 56,
    usedPurchases: 8,
  },
  {
    year: '2023',
    newPurchases: 72,
    usedPurchases: 4,
  },
] satisfies UsedGadgetPurchaseRow[];

function calculateUsedPurchaseShare(
  newPurchases: number,
  usedPurchases: number,
): string {
  const totalPurchases = newPurchases + usedPurchases;

  const usedSharePercent = (usedPurchases / totalPurchases) * 100;
  return `${usedSharePercent.toFixed(1)} %`;
}

export function OsloUsedGadgetTable() {
  return (
    <table className={style.osloUsedGadgetTable}>
      <thead>
        <tr>
          <th>Årstall</th>
          <th>Antall nye</th>
          <th>Antall brukt</th>
          <th>Prosent brukt</th>
        </tr>
      </thead>
      <tbody>
        {usedGadgetPurchaseData.map((purchaseRow) => (
          <tr key={purchaseRow.year}>
            <td>{purchaseRow.year}</td>
            <td>{purchaseRow.newPurchases}</td>
            <td>{purchaseRow.usedPurchases}</td>
            <td>
              {calculateUsedPurchaseShare(
                purchaseRow.newPurchases,
                purchaseRow.usedPurchases,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
