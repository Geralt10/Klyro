import slugify from "slugify";

export const generateUniqueSlug = async (
  value: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> => {
  const baseSlug = slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 2;

  while (await exists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};