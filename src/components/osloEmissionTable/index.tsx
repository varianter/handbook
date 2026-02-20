import React from 'react';
import style from './osloEmissionTable.module.css';

export const OsloEmissionTable = () => {
  return (
    <table className={style.osloEmissionTable}>
      <thead>
        <tr>
          <th>År</th>
          <th>Utlipp per ansatt</th>
          <th>Utslipp for året</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2025</td>
          <td>6 213 kgCo2e</td>
          <td>229 881 kgCo2e</td>
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
          <td>4 625 kgCo2e</td>
          <td>106 370 kgCo2e</td>
        </tr>
        <tr>
          <td>2021</td>
          <td>3 107 kgCo2e</td>
          <td>21 746 kgCo2e</td>
        </tr>
      </tbody>
    </table>
  );
};
