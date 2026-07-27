'use client'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import { t } from '@lingui/macro'
import { signIn, useSession } from 'next-auth/react'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { GoogleLoginRef } from '@/framework/components/login/types'
import { FcGoogle } from 'react-icons/fc'

const GoogleLogin = forwardRef<GoogleLoginRef, any>((props, ref) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
  const { status } = useSession()
  useEffect(() => {
    // 将status状态写入sessionStorage
    sessionStorage.setItem('userStatus', status)
  }, [status])
  const checkAuthenticated = () => {
    const userStatus = sessionStorage.getItem('userStatus')
    return 'authenticated' === userStatus
  }
  useImperativeHandle(
    ref,
    () =>
      ({
        checkAuthenticated: checkAuthenticated,
        open: () => onOpen(),
        close: () => onClose(),
      }) as any
  )
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">AIMEGApro</ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center">
                  <h2 className="md:text-4xl text-2xl font-bold text-center py-6">{t`Please Sign In To Continue`}</h2>
                  <div
                    className="w-11/12 bg-white border border-blue-500 rounded-lg shadow-lg py-1.5 cursor-pointer  hover:text-white hover:bg-opacity-50 hover:bg-blue-300 flex items-center justify-center"
                    onClick={() => signIn('google')}
                  >
                      <span className="text-blue-500 mr-2" aria-hidden="true">
                        <FcGoogle size={32} />
                      </span>
                    <span className="text-lg font-medium ">{t`Sign In With Google`}</span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t`Close`}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
})
GoogleLogin.displayName = 'GoogleLogin'
export default GoogleLogin
