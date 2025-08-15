import { api } from "./axios";

export const searchEmployees= async(q:string)=>{
    const res=await api.get(`/employees/search?q=${q}`);
    return res.data;
}

export const bulkImport=async(file:File)=>{
    const form=new FormData();
    form.append("file",file);
    const res=await api.post("/employees/bulk-import",file);
    return res.data;
}

export const exportEmployees = async (start: string, end: string, format: "xlsx" | "csv") => {
  const res = await api.get("/employees/export", {
    params: { start_date: start, end_date: end, format },
    responseType: "blob"
  });
  return res.data; 
};


export const uploadPhoto=async(id: string,file:File)=>{
  const form = new FormData(); 
  form.append("file", file);
  const res=await api.post(`/employees/${id}/photo`, form)
  return res.data;
};

export const getStatistics=async()=>{
    const res= await api.get("/employees/statistics");
    return res.data;
}

export const bulkUpdateEmployees=async(employee_ids:string[],updates:object)=>{
  const res= await api.post("/employees/bulk-update",{ employee_ids, updates });
  return res.data;
}

export const bulkDeleteEmployees=async(ids: string[])=>{
    const res=await api.delete("/employees/bulk-delete",{ data: ids });
    return res.data;
}
