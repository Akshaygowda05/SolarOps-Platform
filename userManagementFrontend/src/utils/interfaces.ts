export interface CreateUserData {
     name: string,
    email: string,
    password: string,
    role: string,
    applicationId: string

}

export interface SchedularData {
    
  time: string,
  jobType: string,
  groups: { id: string; name: string }[],
  data: string,
}



