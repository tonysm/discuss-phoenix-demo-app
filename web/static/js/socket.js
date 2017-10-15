import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

socket.connect()

const createSocket = (topicId) => {
    let channel = socket.channel(`comments:${topicId}`, {})
    let commentInput = document.getElementById('commentInput');
    let commentsSection = document.getElementById('commentsSection');

    channel.join()
      .receive("ok", ({comments}) => {
          console.log("Joined successfully")
          renderComments(comments, commentsSection)
      })
      .receive("error", resp => { console.log("Unable to join", resp) })


    channel.on(`comments:${topicId}:new`, ({comment}) => {
        renderComment(comment, commentsSection);
    });

    const sendComment = e => {
        e.preventDefault();

        channel.push(`comments:${topicId}`, {content: commentInput.value});

        commentInput.value = '';
    };

    let holdingShift = false;
    const shiftKeyCode = 16;

    commentInput.addEventListener('keydown', function (e) {
        // Send when user clicks enter.
        if (e.keyCode == 13 && !holdingShift) {
            sendComment(e);
        }

        if (e.keyCode == shiftKeyCode) {
            holdingShift = true;
        }
    });

    commentInput.addEventListener('keyup', function (e) {
        if (e.keyCode == shiftKeyCode) {
            holdingShift = false;
        }
    });

    document.getElementById('commentsForm')
        .addEventListener('submit', sendComment);
}

function renderComments (comments, element) {
    const renderedComments = comments.map(commentTemplate);

    element.innerHTML = renderedComments.join('')
}

function renderComment (comment, element) {
    const renderedComment = commentTemplate(comment)

    element.innerHTML += renderedComment
}

function commentTemplate(comment) {
    return `
        <li class="list-group-item">
            ${comment.content}
        </li>
    `;
}

window.createSocket = createSocket;
