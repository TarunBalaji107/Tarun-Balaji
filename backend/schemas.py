from typing import Optional, List
from pydantic import BaseModel, Field

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = None
    color: Optional[str] = "#3b82f6"
    icon: Optional[str] = "folder"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class ProjectOut(ProjectBase):
    id: int
    created_at: Optional[str] = None
    task_count: int = 0

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None
    tags: Optional[List[str]] = []
    project_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    tags: Optional[List[str]] = None
    project_id: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    status: str

class TaskOut(TaskBase):
    id: int
    project_name: Optional[str] = None
    project_color: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class ActivityLogOut(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: str
    timestamp: Optional[str] = None

    class Config:
        from_attributes = True

class DatabaseStats(BaseModel):
    dialect: str
    database_url: str
    tables: List[str]
    is_sqlite: bool
    is_postgresql: bool
    status: str
    total_projects: int
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    blocked_tasks: int
