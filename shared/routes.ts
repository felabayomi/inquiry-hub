import { z } from 'zod';
import { 
  insertUserSchema, insertInquirySchema, insertReflectionSchema, 
  insertResourceSchema, insertMeetingSchema, insertReportVersionSchema, 
  insertCommentSchema, insertSettingSchema, insertInquiryCommentSchema, insertReportSectionSchema, insertJusticeLensSchema, insertInquiryMappingSchema, insertSectionLensMappingSchema, insertSectionFocusContextSchema,
  users, inquiries, reflections, resources, meetings, reportSections, reportVersions, comments, appSettings, inquiryComments, justiceLenses, inquiryMappings, sectionLensMappings, sectionFocusContext
} from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// API Contract
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema.extend({ inviteCode: z.string() }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  inquiries: {
    get: {
      method: 'GET' as const,
      path: '/api/inquiries/mine',
      responses: {
        200: z.custom<typeof inquiries.$inferSelect & { reflections: typeof reflections.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    upsert: {
      method: 'POST' as const,
      path: '/api/inquiries',
      input: insertInquirySchema.omit({ userId: true }),
      responses: {
        200: z.custom<typeof inquiries.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/inquiries/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
      },
    },
    listAll: {
      method: 'GET' as const,
      path: '/api/admin/inquiries',
      responses: {
        200: z.array(z.custom<typeof inquiries.$inferSelect & { user: typeof users.$inferSelect, reflections: typeof reflections.$inferSelect[], comments: (typeof inquiryComments.$inferSelect & { user: typeof users.$inferSelect })[] }>()),
        401: errorSchemas.unauthorized,
      },
    },
    addComment: {
      method: 'POST' as const,
      path: '/api/inquiries/comments',
      input: insertInquiryCommentSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof inquiryComments.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  reflections: {
    create: {
      method: 'POST' as const,
      path: '/api/reflections',
      input: insertReflectionSchema.omit({ id: true, createdAt: true }), // Frontend sends inquiryId
      responses: {
        201: z.custom<typeof reflections.$inferSelect>(),
      },
    },
  },
  resources: {
    list: {
      method: 'GET' as const,
      path: '/api/resources',
      responses: {
        200: z.array(z.custom<typeof resources.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/resources',
      input: insertResourceSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof resources.$inferSelect>(),
      },
    },
  },
  meetings: {
    list: {
      method: 'GET' as const,
      path: '/api/meetings',
      responses: {
        200: z.array(z.custom<typeof meetings.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/meetings',
      input: insertMeetingSchema.extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof meetings.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/meetings/:id',
      input: insertMeetingSchema.extend({
        date: z.coerce.date(),
      }).partial(),
      responses: {
        200: z.custom<typeof meetings.$inferSelect>(),
      },
    },
  },
  report: {
    sections: {
      method: 'GET' as const,
      path: '/api/report/sections',
      responses: {
        200: z.array(z.custom<typeof reportSections.$inferSelect>()),
      },
    },
    createSection: {
      method: 'POST' as const,
      path: '/api/admin/report/sections',
      input: insertReportSectionSchema,
      responses: {
        201: z.custom<typeof reportSections.$inferSelect>(),
      },
    },
    updateSection: {
      method: 'PATCH' as const,
      path: '/api/admin/report/sections/:id',
      input: insertReportSectionSchema.partial(),
      responses: {
        200: z.custom<typeof reportSections.$inferSelect>(),
      },
    },
    deleteSection: {
      method: 'DELETE' as const,
      path: '/api/admin/report/sections/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    latestVersions: {
      method: 'GET' as const,
      path: '/api/report/sections/:sectionId/latest',
      responses: {
        200: z.custom<typeof reportVersions.$inferSelect & { author: typeof users.$inferSelect } | null>(),
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/report/sections/:sectionId/history',
      responses: {
        200: z.array(z.custom<typeof reportVersions.$inferSelect & { author: typeof users.$inferSelect }>()),
      },
    },
    saveVersion: {
      method: 'POST' as const,
      path: '/api/report/versions',
      input: insertReportVersionSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof reportVersions.$inferSelect>(),
      },
    },
    comments: {
      method: 'GET' as const,
      path: '/api/report/sections/:sectionId/comments',
      responses: {
        200: z.array(z.custom<typeof comments.$inferSelect & { author: typeof users.$inferSelect }>()),
      },
    },
    addComment: {
      method: 'POST' as const,
      path: '/api/report/comments',
      input: insertCommentSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
      },
    },
  },
  settings: {
    list: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.array(z.custom<typeof appSettings.$inferSelect>()),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings',
      input: insertSettingSchema,
      responses: {
        200: z.custom<typeof appSettings.$inferSelect>(),
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    updateRole: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id/role',
      input: z.object({ isAdmin: z.boolean() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    updatePassword: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id/password',
      input: z.object({ password: z.string().min(6) }),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    // Self-service endpoints for logged-in users
    updateOwnUsername: {
      method: 'PATCH' as const,
      path: '/api/account/username',
      input: z.object({ username: z.string().min(3).max(30) }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
        409: z.object({ message: z.string() }),
      },
    },
    updateOwnPassword: {
      method: 'PATCH' as const,
      path: '/api/account/password',
      input: z.object({ currentPassword: z.string(), newPassword: z.string().min(6) }),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        400: z.object({ message: z.string() }),
      },
    },
  },
  justiceLenses: {
    list: {
      method: 'GET' as const,
      path: '/api/justice-lenses',
      responses: {
        200: z.array(z.custom<typeof justiceLenses.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/justice-lenses',
      input: insertJusticeLensSchema,
      responses: {
        201: z.custom<typeof justiceLenses.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/justice-lenses/:id',
      input: insertJusticeLensSchema.partial(),
      responses: {
        200: z.custom<typeof justiceLenses.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/justice-lenses/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  inquiryMappings: {
    list: {
      method: 'GET' as const,
      path: '/api/inquiry-mappings',
      responses: {
        200: z.array(z.custom<typeof inquiryMappings.$inferSelect>()),
      },
    },
    active: {
      method: 'GET' as const,
      path: '/api/inquiry-mappings/active',
      responses: {
        200: z.custom<typeof inquiryMappings.$inferSelect>().nullable(),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/inquiry-mappings',
      input: insertInquiryMappingSchema,
      responses: {
        201: z.custom<typeof inquiryMappings.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/inquiry-mappings/:id',
      input: insertInquiryMappingSchema.partial(),
      responses: {
        200: z.custom<typeof inquiryMappings.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/inquiry-mappings/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    setActive: {
      method: 'POST' as const,
      path: '/api/inquiry-mappings/:id/activate',
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    sectionMappings: {
      method: 'GET' as const,
      path: '/api/inquiry-mappings/:id/sections',
      responses: {
        200: z.array(z.custom<typeof sectionLensMappings.$inferSelect>()),
      },
    },
    saveSectionMappings: {
      method: 'POST' as const,
      path: '/api/inquiry-mappings/:id/sections',
      input: z.array(insertSectionLensMappingSchema.omit({ mappingId: true })),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    getFocusContexts: {
      method: 'GET' as const,
      path: '/api/inquiry-mappings/:id/focus-contexts',
      responses: {
        200: z.array(z.custom<typeof sectionFocusContext.$inferSelect>()),
      },
    },
    saveFocusContexts: {
      method: 'POST' as const,
      path: '/api/inquiry-mappings/:id/focus-contexts',
      input: z.array(insertSectionFocusContextSchema.omit({ mappingId: true })),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
