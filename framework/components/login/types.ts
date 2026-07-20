export type GoogleLoginRef = {
  checkAuthenticated:()=>boolean
  open:()=>void
  close:()=>void
}