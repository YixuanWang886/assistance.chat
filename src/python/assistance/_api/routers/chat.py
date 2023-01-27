# Copyright (C) 2023 Assistance.Chat contributors

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


from fastapi import APIRouter, Depends

from assistance._api.login import User, get_current_user
from assistance._api.raw import chat

router = APIRouter(prefix="/chat")


@router.post("/student/start")
async def student_chat_start(
    data: chat.StudentChatStartData,
    current_user: User = Depends(get_current_user),
):
    return await chat.student_chat_start(
        username=current_user.username,
        client_name=data.client_name,
    )


@router.post("/student/continue")
async def student_chat_continue(
    data: chat.StudentChatContinueData,
    current_user: User = Depends(get_current_user),
):
    return await chat.student_chat_continue(
        username=current_user.username,
        client_name=data.client_name,
        client_text=data.client_text,
    )