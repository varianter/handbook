import React from 'react';
import style from './osloEmissionTable.module.css';

export const OsloEmissionTable = () => {
  return (
    <table className={style.osloEmissionTable}>
      <tr>
        <th>År</th>
        <th>Utlipp per årsverk</th>
        <th>Utslipp for året</th>
      </tr>
      <tr>
        <td>2024</td>
        <td>4 312 kgCo2e</td>
        <td>155 235 kgCo2e</td>
      </tr>
      <tr>
        <td>2023</td>
        <td>3 834 kgCo2e</td>
        <td>88 183 KgCo2e</td>
      </tr>
      <tr>
        <td>2022</td>
        <td>3 039 kgCo2e</td>
        <td>106 370 kgCo2e</td>
      </tr>
    </table>
  );
};
