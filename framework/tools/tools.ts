import fs from 'fs'
import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import path from 'path'
import matter from 'gray-matter'

export const getBlogPosts = ():Blog[]=> {
  const allBlogs: Blog[] = []
  for (const langDir of Object.values(AVAILABLE_LOCALES)) {
    const blogs = "tools"
    const filePath = path.join(blogs, langDir)
    const files = fs.readdirSync(filePath)
    // 将内容一并读取到作为参数传递给页面，用于页面编译时直接编译出静态文件
    files.forEach((file) => {
      const markdownFile = fs.readFileSync(
        path.join(blogs, langDir, file),
        'utf-8'
      )
      let slug = file.replace('.mdx', '')
      slug = decodeURIComponent(slug)
      console.log(slug);
      
      const { data: frontMatter,content } = matter(markdownFile)
      allBlogs.push({ slug,lang:langDir, content, title:frontMatter.title, description:frontMatter.description, img: frontMatter.img, listimg: frontMatter.listimg, list: frontMatter.list})
    })
  }
  return allBlogs
}

export type Blog = {
  title: string
  description: string
  img: string
  list: any
  slug: string
  listimg: string
  content:any
  lang:string
}

