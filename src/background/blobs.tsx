import React from 'react';

export type BlobVariations = 'blob-1' | 'blob-2' | 'blob-3';

export type BlobProps = {
  className?: string;
  variation?: BlobVariations;
};

export default function Blob({ className, variation = 'blob-1' }: BlobProps) {
  return (
    <div className={className}>
      <img src={typeToImport(variation)} role="none" alt="" />
    </div>
  );
}

function typeToImport(variation: BlobVariations) {
  switch (variation) {
    case 'blob-1':
      return require('./blob1.svg');
    case 'blob-2':
      return require('./blob2.svg');
    case 'blob-3':
      return require('./blob3.svg');
  }
}
