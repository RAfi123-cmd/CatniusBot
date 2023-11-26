class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages=[];
        this.messages.push(msg1);
        
        
        fetch('/Predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Catnius", message: r.answer };
           // this.messages=[];
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
    }

    extractDriveImageId(url) {
        try {
            const urlParams = new URLSearchParams(new URL(url).search);
            return urlParams.get("id");
        } catch (error) {
            console.error("Invalid URL:", url);
            return null; // or handle the error in a way that makes sense for your application
        }
    }


    updateChatText(chatbox) {
        var html = '';

        this.messages.slice().forEach((item, index) => {
            let messageText = item.message;

            messageText = messageText.replace(/(\d+\.) /g, '<br>$1');

            const hasImage = messageText.includes("![") && messageText.includes("](");

            if (hasImage) {
                const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
                const matches = Array.from(messageText.matchAll(imageRegex));

                for (const match of matches) {
                    const originalMarkdown = match[0];
                    const altText = match[1];
                    const imageUrl = match[2];
                    const driveImageId = this.extractDriveImageId(imageUrl);
                    const imgTag = `<a href="${imageUrl}" target="_blank"><img src="https://drive.google.com/uc?id=${driveImageId}" alt="${altText}" class="response-image"></a>`;
                    messageText = messageText.replace(originalMarkdown, imgTag);
                }
            }

            if (messageText.includes("-")) {
                messageText = messageText.replace(/-/g, '<br>');
            }

            if (item.name === "Catnius") {
                html += '<div class="messages__item messages__item--operator">' + messageText + '</div>';
            } else {
                html += '<div class="messages__item messages__item--visitor">' + messageText + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.insertAdjacentHTML('beforeend', html);
    }
}

const chatbox = new Chatbox();
chatbox.display(); 