import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'

// function Table({ data }:{data:any}) {
//   let headers = data.headers.map((header:any, index:number) => (
//     <th key={index}>{header}</th>
//   ))
//   let rows = data.rows.map((row:any, index:number) => (
//     <tr key={index}>
//       {row.map((cell:any, cellIndex:number) => (
//         <td key={cellIndex}>{cell}</td>
//       ))}
//     </tr>
//   ))

//   return (
//     <table>
//       <thead>
//       <tr>{headers}</tr>
//       </thead>
//       <tbody>{rows}</tbody>
//     </table>
//   )
// }

function parseTableValue(value: any) {
  if (typeof value !== 'string') {
    return value ?? []
  }
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

function Table({ data, headers, rows }:{data?:any,headers?:any,rows?:any}) {
  const tableHeaders = parseTableValue(data?.headers ?? headers)
  const tableRows = parseTableValue(data?.rows ?? rows)
  let headersa = tableHeaders.map((header:any, index:number) => (
    <th key={index}>{header}</th>
  ))
  let rowsa = tableRows.map((row:any, index:number) => (
    <tr key={index}>
      {row.map((cell:any, cellIndex:number) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
      <tr>{headersa}</tr>
      </thead>
      <tbody>{rowsa}</tbody>
    </table>
  )
}

function CustomLink(props:any) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage({ alt, width, height, ...props }: any) {
  return (
    <div className="my-4 flex justify-center">
      <Image 
        alt={alt} 
        width={900}
        height={450}
        className="rounded-lg object-contain max-w-full h-auto"
        {...props}
      />
    </div>
  )
}

function Code({ children, ...props }:{children:any}) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str:string) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level:number) {
  const Heading = ({ children }:{children:any}) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  img: (props: any) => <RoundedImage {...props} />,
  a: CustomLink,
  code: Code,
  Table,
}

export function CustomMDX(props:any) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}

// 添加默认导出
export default CustomMDX;
