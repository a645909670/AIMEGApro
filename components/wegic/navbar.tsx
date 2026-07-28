'use client'


import React, { useEffect, useMemo, useRef } from 'react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Skeleton,
  User
} from '@nextui-org/react'
import { usePathname } from 'next/navigation'
import useNavigation from '@/framework/hooks/useNavigation'
import { Dropdown as AntDropDown } from 'antd'
import { signIn, useSession ,signOut} from 'next-auth/react'
import { t } from '@lingui/macro'
import useI18nLocale from '@/framework/hooks/useI18nLocale'
import { FaAngleRight, FaArrowUpFromBracket } from 'react-icons/fa6'
import NextLink from 'next/link'
import { SessionUser } from '@/framework/types/sessionUser'
import clsx from 'clsx'
import { LuLanguages } from 'react-icons/lu'
import { siteConfig } from '@/config/site'
import { FcGoogle } from 'react-icons/fc'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Input,
} from '@nextui-org/react'
import { message } from 'antd'

export interface NavItem extends Record<string, any> {
  title: string
  href: string
}


export type NavbarProps = {
  items: NavItem[]
  locale?: string
}


export default function Nav({ items, locale }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const { data, status, update } = useSession()
  const isUnauthenticated = useMemo(() => 'unauthenticated' === status, [status])
  const isAuthenticated = useMemo(() => 'authenticated' === status, [status])
  const isSessionLoading = useMemo(() => 'loading' === status, [status])
  const hasRequestedSessionRefresh = useRef(false)
  const [pathWithoutLocale, isActive] = useNavigation(pathname)
  const [currentLocale, locales] = useI18nLocale(locale)
  const user = data?.user as SessionUser

  const { isOpen: isRegOpen, onOpen: onRegOpen, onClose: onRegClose } = useDisclosure()
  const [regForm, setRegForm] = React.useState({ email: '', name: '' })
  const [regLoading, setRegLoading] = React.useState(false)
  const [regResult, setRegResult] = React.useState<string | null>(null)

  useEffect(() => {
    if (hasRequestedSessionRefresh.current) return

    hasRequestedSessionRefresh.current = true
    void update().catch((error) => {
      console.error('[auth] Failed to refresh homepage session', error)
      message.error(t`Unable to check sign-in status. Please try again.`)
    })
  }, [update])

  /**
   * 使用与编辑页面一致的 NextAuth Google 登录流程。
   * 会话恢复期间不触发登录跳转，避免把 loading 状态误判为未登录。
   * @returns {Promise<void>} 登录流程完成后的异步结果
   */
  const handleGoogleSignIn = async (): Promise<void> => {
    if (isSessionLoading) {
      message.info(t`Checking sign-in status. Please try again in a moment.`)
      return
    }

    try {
      await signIn('google')
    } catch (error) {
      console.error('[auth] Google sign-in failed', error)
      message.error(t`Google sign-in failed. Please try again.`)
    }
  }

  const handleRegister = async () => {
    if (!regForm.email) return
    setRegLoading(true)
    setRegResult(null)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      })
      const data = await res.json()
      if (data.code === 200) {
        setRegResult(`注册成功！ID: ${data.data.id}, 积分: ${data.data.credit}`)
      } else {
        setRegResult(`注册失败：${data.message}`)
      }
    } catch (e: any) {
      setRegResult(`注册失败：${e.message}`)
    }
    setRegLoading(false)
  }

  const localDropdown = (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" startContent={<LuLanguages size={16}/>}>
          {currentLocale}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode={"single"}
        aria-label="change locale"
        className='dropdown-grid p-2'
        style={{ width: "auto", minWidth: "200px" }} // 使用 NextUI 的 CSS-in-JS 来控制宽度
      >
        {locales.map((item) => (
          <DropdownItem key={item.key} className="col-span-1 hover:text-primary">
            <NextLink
              className={currentLocale === item.key ? 'text-primary-200 w-full' : 'flex items-center gap-2 text-gray-500 hover:text-primary w-full'}
              replace={true}
              href={`/${item.key}${pathWithoutLocale}`}
            >
              <FaAngleRight />{item.name}
            </NextLink>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )


  return (
    <Navbar maxWidth="xl"
            classNames={{ item: 'text-white  data-[active=true]:text-white data-[active=true]:px-5 data-[active=true]:py-1 data-[active=true]:text-primary data-[active=true]:bg-primary data-[active=true]:rounded-2xl' }}
            onMenuOpenChange={setIsMenuOpen}>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className="sm:hidden"
      />
      <NavbarBrand>
        <img className="md:ml-3 ml-0 w-auto h-8 md:h-12  object-cover "
             src="/logo.png"
             alt="logo" />
        <div>
          <p className="ml-2 font-bold text-sm md:text-2xl">{siteConfig.name}</p>
          {
            siteConfig.slogan&& (
              <p className="ml-2 text-xs hidden md:block md:text-sm text-primary">{siteConfig.slogan}</p>
            )
          }
        </div>

      </NavbarBrand>

      <NavbarContent className="hidden md:flex gap-10" justify="center">
        {
          items.map(it => (
            <NavbarItem
              key={it.title}
              isActive={isActive(it.href)}
              className={clsx({
                '!bg-gradient-to-r !from-blue-500 !to-purple-600 rounded-full px-4 py-2': isActive(it.href),
              })}
            >
              <NextLink
                className={clsx('text-foreground', { 'text-white': isActive(it.href) })}
                href={locale ? `/${locale}${it.href}` : it.href}>{it.title}</NextLink>
            </NavbarItem>
          ))
        }
      </NavbarContent>

      <NavbarMenu>
        {
          items.map((it, index) => (
            <NavbarMenuItem key={`${it.title}-${index}`}>
              <Link
                size="lg"
                color="foreground"
                href={`/${locale}${it.href}`}>
                {it.title}
              </Link>
            </NavbarMenuItem>
          ))
        }
        <NavbarMenuItem key="locale" className="-ml-4">
          {
            localDropdown
          }
        </NavbarMenuItem>
      </NavbarMenu>

      <NavbarContent as="div" justify="end">
        {
          isSessionLoading ? (
            <Skeleton className="rounded-lg w-24 h-8" />
          ) : isUnauthenticated && siteConfig.showLogin ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  color={'primary'}
                  variant="flat"
                  startContent={<FcGoogle size="1em" color="white" />}
                  onClick={() => void handleGoogleSignIn()}
                >{t`Sign In With Google`}</Button>
              </div>
              <div className="sm:hidden">
                <Button size="sm" color={'primary'} variant="flat" onClick={() => void handleGoogleSignIn()}>{t`Sign In`}</Button>
              </div>
            </>
          ) : (
            <AntDropDown menu={{
              items: [
                {
                  key: 'profile',
                  className: 'h-14 gap-2',
                  disabled: true,
                  label: <>
                    <p className="font-semibold">{user?.email ?? ''}</p>
                  </>
                },
                {
                  key: 'logout',
                  itemIcon: <FaArrowUpFromBracket />,
                  label: t`Log Out`,
                  onClick: () => signOut()
                }
              ]
            }}>
              <Skeleton isLoaded={isAuthenticated} className="rounded-lg">
                {
                  user?.image && (
                    <User
                      name={user?.name ?? ''}
                      className="cursor-pointer"
                      avatarProps={{
                        lang: locale,
                        src: user?.image ?? '#'
                      }}></User>
                  )
                }
              </Skeleton>
            </AntDropDown>)
        }

        <div className="hidden sm:block">
          {localDropdown}
        </div>
      </NavbarContent>
    
        {/* 注册弹窗 */}
        <Modal isOpen={isRegOpen} onClose={onRegClose}>
          <ModalContent>
            <ModalHeader>Create Account</ModalHeader>
            <ModalBody>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              />
              <Input
                label="Name"
                placeholder="Enter your name"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              />
              {regResult && (
                <p className={'text-sm ' + (regResult.includes('成功') ? 'text-green-600' : 'text-red-600')}>
                  {regResult}
                </p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onRegClose}>Close</Button>
              <Button color="primary" onPress={handleRegister} isLoading={regLoading}>
                Register
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

    </Navbar>
  )
}
