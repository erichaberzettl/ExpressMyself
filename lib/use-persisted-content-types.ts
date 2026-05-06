"use client";

import { useEffect, useRef, useState } from "react";
import { expressionContentTypes } from "@/lib/expression-content";
import { ExpressionContentType } from "@/lib/types";

const PERSISTED_CONTENT_TYPES_STORAGE_KEY = "express-myself-content-types";

function isExpressionContentType(value: string): value is ExpressionContentType {
  return expressionContentTypes.includes(value as ExpressionContentType);
}

function isPersistedContentTypeList(value: unknown): value is ExpressionContentType[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && isExpressionContentType(item))
  );
}

export function usePersistedContentTypes(
  initialContentTypes: ExpressionContentType[] = expressionContentTypes
) {
  const [selectedContentTypes, setSelectedContentTypes] =
    useState<ExpressionContentType[]>(initialContentTypes);
  const hasHydrated = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(PERSISTED_CONTENT_TYPES_STORAGE_KEY);

    if (!stored) {
      hasHydrated.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      if (isPersistedContentTypeList(parsed)) {
        setSelectedContentTypes(parsed);
      }
    } catch {
      window.localStorage.removeItem(PERSISTED_CONTENT_TYPES_STORAGE_KEY);
    }

    hasHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) {
      return;
    }

    window.localStorage.setItem(
      PERSISTED_CONTENT_TYPES_STORAGE_KEY,
      JSON.stringify(selectedContentTypes)
    );
  }, [selectedContentTypes]);

  const toggleContentType = (contentType: ExpressionContentType) => {
    setSelectedContentTypes((current) => {
      if (current.includes(contentType)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((item) => item !== contentType);
      }

      return [...current, contentType];
    });
  };

  return [selectedContentTypes, toggleContentType] as const;
}
