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

# Prompt inspired by the work provided under an MIT license over at:
# https://github.com/hwchase17/langchain/blob/ae1b589f60a/langchain/agents/conversational/prompt.py#L1-L36

import logging
import textwrap

from assistance._completions import completion_with_back_off
from assistance._config import ROOT_DOMAIN
from assistance._keys import get_openai_api_key
from assistance._mailgun import send_email

from .reply import create_reply
from .types import Email

OPEN_AI_API_KEY = get_openai_api_key()


MODEL_KWARGS = {
    "engine": "text-davinci-003",
    "max_tokens": 512,
    "best_of": 1,
    "temperature": 0.7,
    "top_p": 1,
    "frequency_penalty": 0.1,
    "presence_penalty": 0.1,
}


PROMPT = textwrap.dedent(
    """
        You are sending and receiving multiple emails from
        "{user_email}". Your email address is {agent_name}@{ROOT_DOMAIN}.

        Task
        ----

        {prompt_task}

        Email subject
        -------------

        {subject}

        The email chain thus far, most recent email first
        -------------------------------------------------

        {body_plain}

        Next email to send to {user_email}
        -----------------------------------
    """
).strip()


async def react_to_custom_agent_request(email: Email, prompt_task: str):
    prompt = PROMPT.format(
        body_plain=email["body-plain"],
        user_email=email["user-email"],
        prompt_task=prompt_task,
        agent_name=email["agent-name"],
        subject=email["subject"],
        ROOT_DOMAIN=ROOT_DOMAIN,
    )
    logging.info(prompt)

    completions = await completion_with_back_off(
        user_email=user_email, prompt=prompt, api_key=OPEN_AI_API_KEY, **MODEL_KWARGS
    )
    response: str = completions.choices[0].text.strip()

    logging.info(response)

    subject, total_reply = create_reply(
        subject=email["subject"],
        body_plain=email["body-plain"],
        response=response,
        user_email=email["user-email"],
    )

    mailgun_data = {
        "from": f"{email['agent-name']}@{ROOT_DOMAIN}",
        "to": email["user-email"],
        "subject": subject,
        "text": total_reply,
    }

    await send_email(mailgun_data)
