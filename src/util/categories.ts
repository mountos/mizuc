import { getPosts } from '@/util/posts'

export const generateCategories = async (): Promise<string[]> => {
  const allPosts = await getPosts()
  const categories = allPosts
    .map((p) => p.data.category)
    .filter((c): c is string => !!c)
  
  return [...new Set(categories)].sort()
}

export const getCategoryUsage = async (category: string): Promise<number> => {
  const allPosts = await getPosts()
  return allPosts.filter((p) => p.data.category === category).length
}
