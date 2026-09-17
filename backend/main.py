import sys
import os
from contextlib import asynccontextmanager
from typing import Optional, List
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from backend.database import engine, Base, get_db, get_db_info
from backend.models import Project, Task, ActivityLog
from backend.schemas import (
    ProjectCreate, ProjectUpdate, ProjectOut,
    TaskCreate, TaskUpdate, TaskStatusUpdate, TaskOut,
    ActivityLogOut, DatabaseStats
)

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

def seed_default_data(db: Session):
    """Seed initial sample data if the database is empty."""
    if db.query(Project).count() == 0 and db.query(Task).count() == 0:
        # Create default projects
        p1 = Project(
            name="Website Redesign",
            description="Revamp landing page and modernize UI design system with Tailwind CSS",
            color="#3b82f6",
            icon="layout"
        )
        p2 = Project(
            name="API & Backend Services",
            description="Build FastAPI endpoints, SQLAlchemy ORM models, and database migrations",
            color="#10b981",
            icon="server"
        )
        p3 = Project(
            name="Mobile Application",
            description="Cross-platform client applications and push notification services",
            color="#f59e0b",
            icon="smartphone"
        )
        db.add_all([p1, p2, p3])
        db.commit()

        # Create default tasks
        tasks = [
            Task(
                title="Design interactive task dashboard",
                description="Create modern Kanban and list views with responsive filters and real-time status updates.",
                status="in_progress",
                priority="high",
                due_date="2026-09-20",
                tags="UI/UX, Frontend, React",
                project_id=p1.id
            ),
            Task(
                title="Configure FastAPI and SQLAlchemy engine",
                description="Set up database connection pool, automatic table schema reflection, and SQLite/PostgreSQL support.",
                status="completed",
                priority="urgent",
                due_date="2026-09-16",
                tags="Backend, Python, Database",
                project_id=p2.id
            ),
            Task(
                title="Implement CRUD API endpoints",
                description="Expose RESTful endpoints for projects, tasks, filtering, sorting, and activity audit logging.",
                status="completed",
                priority="high",
                due_date="2026-09-17",
                tags="FastAPI, REST",
                project_id=p2.id
            ),
            Task(
                title="Optimize database queries and indexing",
                description="Add compound indexes on task status and priority for sub-millisecond query execution.",
                status="pending",
                priority="medium",
                due_date="2026-09-25",
                tags="Performance, SQL",
                project_id=p2.id
            ),
            Task(
                title="Mobile responsive viewport testing",
                description="Verify touch interaction, swipe gestures, and layout reflow across mobile screen dimensions.",
                status="pending",
                priority="low",
                due_date="2026-09-28",
                tags="QA, Mobile",
                project_id=p3.id
            ),
            Task(
                title="Resolve blocked image upload webhook",
                description="Investigate payload size limit issue on the media storage callback endpoint.",
                status="blocked",
                priority="urgent",
                due_date="2026-09-18",
                tags="Bug, API",
                project_id=p2.id
            )
        ]
        db.add_all(tasks)

        # Initial activity log
        log = ActivityLog(
            action="INITIALIZE",
            entity_type="system",
            details="Database bootstrapped with sample projects and tasks."
        )
        db.add(log)
        db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and seed default data
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_default_data(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="FastAPI & SQLAlchemy Task API",
    description="Production-ready REST API powered by Python, FastAPI, and SQLAlchemy ORM",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def log_activity(db: Session, action: str, entity_type: str, entity_id: Optional[int], details: str):
    log = ActivityLog(action=action, entity_type=entity_type, entity_id=entity_id, details=details)
    db.add(log)
    db.commit()

router = APIRouter()

# --- Health & Diagnostic Endpoints ---

@router.get("/health")
@router.head("/health")
def get_health():
    db_info = get_db_info()
    return {
        "status": "healthy",
        "service": "FastAPI Backend",
        "python_version": sys.version.split()[0],
        "database": db_info
    }

@router.get("/stats", response_model=DatabaseStats)
def get_stats(db: Session = Depends(get_db)):
    db_info = get_db_info()
    total_projects = db.query(Project).count()
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == "completed").count()
    in_progress_tasks = db.query(Task).filter(Task.status == "in_progress").count()
    pending_tasks = db.query(Task).filter(Task.status == "pending").count()
    blocked_tasks = db.query(Task).filter(Task.status == "blocked").count()

    return DatabaseStats(
        dialect=db_info["dialect"],
        database_url=db_info["database_url"],
        tables=db_info["tables"],
        is_sqlite=db_info["is_sqlite"],
        is_postgresql=db_info["is_postgresql"],
        status=db_info["status"],
        total_projects=total_projects,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        in_progress_tasks=in_progress_tasks,
        pending_tasks=pending_tasks,
        blocked_tasks=blocked_tasks,
    )

# --- Projects Endpoints ---

@router.get("/projects", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.name).all()
    return [p.to_dict() for p in projects]

@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        name=project_in.name,
        description=project_in.description,
        color=project_in.color or "#3b82f6",
        icon=project_in.icon or "folder"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    log_activity(db, "CREATE_PROJECT", "project", project.id, f"Created project '{project.name}'")
    return project.to_dict()

@router.put("/projects/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, project_in: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_in.name is not None:
        project.name = project_in.name
    if project_in.description is not None:
        project.description = project_in.description
    if project_in.color is not None:
        project.color = project_in.color
    if project_in.icon is not None:
        project.icon = project_in.icon
        
    db.commit()
    db.refresh(project)
    log_activity(db, "UPDATE_PROJECT", "project", project.id, f"Updated project '{project.name}'")
    return project.to_dict()

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    name = project.name
    db.delete(project)
    db.commit()
    log_activity(db, "DELETE_PROJECT", "project", project_id, f"Deleted project '{name}'")
    return {"message": f"Project '{name}' deleted"}

# --- Tasks Endpoints ---

@router.get("/tasks", response_model=List[TaskOut])
def list_tasks(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query(default="created_at_desc", pattern="^(created_at_desc|created_at_asc|priority|due_date)$"),
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)
    if status and status != "all":
        query = query.filter(Task.status == status)
    if priority and priority != "all":
        query = query.filter(Task.priority == priority)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term),
                Task.tags.ilike(search_term)
            )
        )

    if sort_by == "created_at_desc":
        query = query.order_by(desc(Task.created_at))
    elif sort_by == "created_at_asc":
        query = query.order_by(Task.created_at)
    elif sort_by == "due_date":
        query = query.order_by(Task.due_date.asc())
    else:
        query = query.order_by(desc(Task.created_at))

    tasks = query.all()
    return [t.to_dict() for t in tasks]

@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task.to_dict()

@router.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    tags_str = ", ".join(task_in.tags) if task_in.tags else ""
    task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status or "pending",
        priority=task_in.priority or "medium",
        due_date=task_in.due_date,
        tags=tags_str,
        project_id=task_in.project_id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    log_activity(db, "CREATE_TASK", "task", task.id, f"Created task '{task.title}'")
    return task.to_dict()

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.status is not None:
        task.status = task_in.status
    if task_in.priority is not None:
        task.priority = task_in.priority
    if task_in.due_date is not None:
        task.due_date = task_in.due_date
    if task_in.tags is not None:
        task.tags = ", ".join(task_in.tags)
    if task_in.project_id is not None:
        task.project_id = task_in.project_id if task_in.project_id > 0 else None

    db.commit()
    db.refresh(task)
    log_activity(db, "UPDATE_TASK", "task", task.id, f"Updated task '{task.title}'")
    return task.to_dict()

@router.patch("/tasks/{task_id}/status", response_model=TaskOut)
def update_task_status(task_id: int, status_in: TaskStatusUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = status_in.status
    db.commit()
    db.refresh(task)
    log_activity(db, "STATUS_CHANGE", "task", task.id, f"Changed status of '{task.title}' to {task.status}")
    return task.to_dict()

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    title = task.title
    db.delete(task)
    db.commit()
    log_activity(db, "DELETE_TASK", "task", task_id, f"Deleted task '{title}'")
    return {"message": f"Task '{title}' deleted"}

# --- Activity Log Endpoint ---

@router.get("/activity", response_model=List[ActivityLogOut])
def get_activity(limit: int = 25, db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(desc(ActivityLog.timestamp)).limit(limit).all()
    return [l.to_dict() for l in logs]

# --- Database Reset & Seed Endpoint ---

@router.post("/seed")
def seed_database(db: Session = Depends(get_db)):
    db.query(Task).delete()
    db.query(Project).delete()
    db.query(ActivityLog).delete()
    db.commit()
    seed_default_data(db)
    return {"message": "Database reset and seeded with default projects and tasks"}

# Register routes with BOTH /api prefix and directly without prefix
app.include_router(router, prefix="/api")
app.include_router(router)
