import React from "react";
import Blob from "./blobs";
import style from "./background.module.css";

export default function BackgroundBlobs() {
  return (
    <div className={style.backgroundContainer}>
      <Blob variation="blob-1" className={style.background__first} />
      <Blob variation="blob-2" className={style.background__second} />
      <Blob variation="blob-3" className={style.background__third} />
    </div>
  );
}
