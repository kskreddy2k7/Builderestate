import React, { useEffect, useRef, useState } from 'react';

export default function OptimizedImage({
  src,
  alt,
  className,
  eager = false,
  sizes,
  fallbackSrc = '',
  ...rest
}) {
  const imgRef = useRef(null);
  const [resolvedSrc, setResolvedSrc] = useState(eager ? src : '');
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    if (eager) {
      setResolvedSrc(src);
      return undefined;
    }

    const node = imgRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setResolvedSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, src]);

  useEffect(() => {
    if (!resolvedSrc) return;
    const image = new Image();
    image.src = resolvedSrc;
    if (image.decode) {
      image.decode().catch(() => {});
    }
  }, [resolvedSrc]);

  return (
    <img
      ref={imgRef}
      src={resolvedSrc || fallbackSrc}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      sizes={sizes}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          setResolvedSrc(fallbackSrc);
        }
      }}
      {...rest}
    />
  );
}
