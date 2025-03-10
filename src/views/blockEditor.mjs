
import EditorJS from '../editor/editorjs.mjs';
import Header from '../editor/block/header.mjs';
import { messageHandlers } from '../socket/msgHandler.mjs';
import { sendMessageWithRetry, sendMsgWithRes } from '../socket/sender.mjs';
import Button from '../editor/block/button.mjs';
import MarkerTool from '../editor/inlineTool/inlineTool.mjs';
import MyBlockTune from '../editor/blockTune/blockTune.mjs';
import Input from '../editor/block/input.mjs'
import InlineCode from '../editor/inlineTool/inline-code.mjs';
import CodeTool from '../editor/block/code.mjs';
import EditorjsList from '../editor/block/editorjs-list.mjs';
import Embed from '../editor/block/embed.mjs';
import Checklist from '../editor/block/checklist.mjs'
import SimpleImage from '../editor/block/simple-image.mjs';
import { Controller } from '../Controller/Controller.mjs';
import { Runner } from '../Runner/Runner.mjs';
import MySocket from '../socket/MySocket.mjs';


const idIndexMap = {};
const myRunner = new Runner();
//为controller绑定消息回调函数
const controller = new Controller(myRunner.callback);

// first define the tools to be made avaliable in the columns
let column_tools = {
    alert: Alert,
    delimiter: Delimiter,
    header: { class: Header, inlineToolbar: true },

    embed: Embed,
    input: Input,
    checklist: {
        class: Checklist,
        inlineToolbar: true,
    },
    image: SimpleImage,
    button: {
        class: Button,

    },
    list: {
        class: EditorjsList,
        inlineToolbar: true,
        config: {
            defaultStyle: 'unordered'
        },
    },
    code: editorjsCodeflask,
    mark: {
        class: MarkerTool,
        shortcut: 'CMD+M',
    },
    inlineCode: {
        class: InlineCode,
        shortcut: 'CMD+SHIFT+M',
    },
    myTune: {
        class: MyBlockTune

    }
}

var editor = new EditorJS({

    holder: 'editorjs',
    tools: {
        alert: Alert,
        delimiter: Delimiter,
        header: { class: Header, inlineToolbar: true },

        embed: Embed,
        input: Input,
        checklist: {
            class: Checklist,
            inlineToolbar: true,
        },
        image: SimpleImage,
        button: {
            class: Button,

        },
        list: {
            class: EditorjsList,
            inlineToolbar: true,
            config: {
                defaultStyle: 'unordered'
            },
        },
        code: editorjsCodeflask,
        mark: {
            class: MarkerTool,
            shortcut: 'CMD+M',
        },
        inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+M',
        },
        myTune: {
            class: MyBlockTune

        },
        columns: {
            class: editorjsColumns,
            config: {
                EditorJsLibrary: EditorJS, // Pass the library instance to the columns instance.
                tools: column_tools, // IMPORTANT! ref the column_tools
                tunes: ['myTune']
            }
        }

    },
    tunes: ['myTune'],

})

//WebSocket通信
const ws = new MySocket("ws://127.0.0.1:5200/");
ws.sendMsg({ type: 'test-from-client', data: {} }).then((data) => {
    console.log('服务端回复', data);
})
window.ws = ws;


//建立id与index映射
async function buildIdIndexMap(editor) {
    return editor.save().then((outputData) => {
        for (let i = 0; i < outputData.blocks.length; i++) {
            const block = outputData.blocks[i];
            // 将id与index映射保存到全局变量中
            idIndexMap[block.id] = i;
        }
    }).catch((error) => {
        console.log('保存失败：', error)
    });
}

async function getBlockIndexByID(id) {

    await buildIdIndexMap(editor);
    if (idIndexMap[id] !== undefined) {
        return idIndexMap[id];
    } else {
        console.log('id not found in idIndexMap');
        return -1;
    }


}




//侧边栏

// const addWorkflowBtn = document.getElementById('add-workflow');
// addWorkflowBtn.addEventListener('click', () => {
//     const workflowList = document.getElementById('workflow-list');
//     workflowList.style.display = 'block';
//     document.querySelector('.primary').addEventListener('click', () => {
//         const eventType = document.getElementById('eventType').value;
//         const action = document.getElementById('action').value;
//         const id = editor.blocks.getBlockByIndex(editor.blocks.getCurrentBlockIndex()).id;

//         editor.save().then((outputData) => {
//             console.log('保存成功：', outputData);
//             console.log('index', editor.blocks.getCurrentBlockIndex())
//             const blockType = outputData.blocks[editor.blocks.getCurrentBlockIndex()].type
//             myRunner.bind({
//                 "eventType": eventType,
//                 "flowId": action,
//                 "blockId": id,
//                 "blockType": blockType
//             }, controller, editor)
//         }).catch((error) => {
//             console.log('保存失败：', error);
//         });



//         //todo
//         workflowList.style.display = 'none';
//     });

//     document.querySelector('.cancel').addEventListener('click', () => {
//         document.getElementById('eventType').selectedIndex = 0;
//         document.getElementById('action').selectedIndex = 0;
//         workflowList.style.display = 'none';
//     });
// })











function createMenu(data) {
    const menu = document.createElement('div');
    menu.className = 'menu';

    function createMenuItem(item, level = 0) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';

        const itemName = document.createElement('span');
        itemName.textContent = item.name;
        menuItem.appendChild(itemName);

        if (item.children && item.children.length > 0) {
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-icon'; // 添加类名
            toggleIcon.textContent = '>';
            menuItem.appendChild(toggleIcon);

            const subMenu = document.createElement('div');
            subMenu.className = 'sub-menu';

            item.children.forEach(child => {
                subMenu.appendChild(createMenuItem(child, level + 1));
            });

            menuItem.appendChild(subMenu);

            toggleIcon.addEventListener('click', () => {
                subMenu.style.display = subMenu.style.display === 'block' ? 'none' : 'block';
                console.log('Clicked on menu item:', item.name);
                // 切换旋转状态
                toggleIcon.classList.toggle('rotated');
            });
        } else {
            menuItem.addEventListener('click', () => {
                //window.location.href = item.url;
                const argsInput = document.getElementById('args-input');
                argsInput.value = argsInput.value + item.url + "}";
                document.getElementById('menu').innerHTML = '';

            });
        }

        return menuItem;
    }

    data.children.forEach(child => {
        menu.appendChild(createMenuItem(child));
    });

    return menu;
}


/*
//buildDropdown(menuData);
//监听args-input焦点事件
const argsInput = document.getElementById('args-input');
argsInput.addEventListener('focus', () => {
    editor.save().then((outputData) => {
        console.log('args-input focus', outputData);
        //将outputData转换为menuData的形式
        console.log(transOutputToMenuData(outputData));

        // 清空menu容器中的内容
        const menuContainer = document.getElementById('menu');
        menuContainer.innerHTML = '';

        menuContainer.appendChild(createMenu(transOutputToMenuData(outputData)));
    })
});
*/





function transOutputToMenuData(outputData) {
    var menuData = { name: 'Blocks', children: [] };
    for (let i = 0; i < outputData.blocks.length; i++) {
        menuData.children.push({
            name: "block" + i,
            children: transDataToMenuData(outputData.blocks[i].data, ['block', i.toString(), 'data'], 'data')
        });
    }

    return menuData;
}
function transDataToMenuData(data, path, prekey) {
    // 截止条件：data不是数组也不是对象，或者data为空
    //console.log(typeof data);
    //console.log(data);
    var menuData = [];
    if (typeof data !== 'object' || data === null) {

        return [{ "name": prekey, "url": path.join('.') }];
    }

    //console.log(typeof data, data);
    // 遍历data对象
    if (!Array.isArray(data)) {
        for (let key in data) {
            const value = data[key];

            const mid = transDataToMenuData(value, path.concat(key), key);
            if (mid.length == 1)
                menuData.push(mid[0]);
            else menuData.push({ "name": key, "children": mid });

        }
    } else {
        //console.log('数组', data);
        data.forEach((item, index) => {
            const middata = transDataToMenuData(item, path.concat(index), prekey + index.toString());
            /*
            middata.forEach(mid => {
                menuData.push(mid);
            })
                */
            menuData.push({ "name": index, "children": middata });
        });
    }

    return menuData;
}


function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    if (sidebar.style.right === '-400px') {
        sidebar.style.right = '0';
        content.style.marginRight = '300px';
    } else {
        sidebar.style.right = '-400px';
        content.style.marginRight = '0';
    }
}
document.getElementById('sidebar-toggle-btn').addEventListener('click', toggleSidebar);

document.getElementById('property').style.backgroundColor = '#575757';
console.log('blockEditor.mjs loaded');








// 将 editor, controller, myRunner 挂载到全局对象
window.editor = editor;
window.controller = controller;
window.myRunner = myRunner;

window.parent.DRAPI.saveFile((dataDir) => {
    console.log('saveFile')
    editor.clear()
    editor.save().then((outputData) => {
        console.log
            ('文章数据：', outputData);
        //writeFile(dataDir, JSON.stringify(outputData))

        window.parent.DRAPI.write(dataDir, JSON.stringify(outputData)).then(() => {
            console.log('File written successfully.');
        }).catch((error) => {
            console.log('写入文件失败：', error);
        });

    }).catch((error) => {
        console.log('保存失败：', error)
    });
}
)

window.parent.DRAPI.recoverFile((dataDir) => {
    window.parent.DRAPI.read(dataDir).then((outputData) => {
        console.log('读取文件成功：', outputData);
        const data = JSON.parse(outputData);
        console.log(data);

        editor.destroy()
        // 在这里处理读取到的数据
        editor = new EditorJS({

            holder: 'editorjs',
            tools: {
                header: { class: Header, inlineToolbar: true },

                embed: Embed,
                input: Input,
                checklist: {
                    class: Checklist,
                    inlineToolbar: true,
                },
                image: SimpleImage,
                button: {
                    class: Button,

                },
                list: {
                    class: EditorjsList,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: 'unordered'
                    },
                },
                code: editorjsCodeflask,
                mark: {
                    class: MarkerTool,
                    shortcut: 'CMD+M',
                },
                inlineCode: {
                    class: InlineCode,
                    shortcut: 'CMD+SHIFT+M',
                },
                myTune: {
                    class: MyBlockTune

                },
                columns: {
                    class: editorjsColumns,
                    config: {
                        EditorJsLibrary: EditorJS, // Pass the library instance to the columns instance.
                        tools: column_tools // IMPORTANT! ref the column_tools
                    }
                }

            },
            tunes: ['myTune'],
            data: data


        })
    }).catch((error) => {
        console.log('读取文件失败：', error);
    });
}
)

window.parent.DRAPI.openFile((dataDir) => {
    window.parent.DRAPI.read(dataDir).then((outputData) => {
        console.log('读取文件成功：', outputData);
        const data = JSON.parse(outputData);
        console.log(data);

        editor.destroy()
        // 在这里处理读取到的数据
        editor = new EditorJS({

            holder: 'editorjs',
            tools: {
                header: { class: Header, inlineToolbar: true },

                embed: Embed,
                input: Input,
                checklist: {
                    class: Checklist,
                    inlineToolbar: true,
                },
                image: SimpleImage,
                button: {
                    class: Button,
                    data: {}
                },
                list: {
                    class: EditorjsList,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: 'unordered'
                    },
                },
                code: CodeTool,
                mark: {
                    class: MarkerTool,
                    shortcut: 'CMD+M',
                },
                inlineCode: {
                    class: InlineCode,
                    shortcut: 'CMD+SHIFT+M',
                },
                myTune: MyBlockTune,

            },
            tunes: ['myTune'],
            data: data


        })
    }).catch((error) => {
        console.log('读取文件失败：', error);
    });
})

document.addEventListener('DOMContentLoaded', async () => {

    const clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', async () => {
        console.log('clear data')
        editor.blocks.clear()


    });

    const insertButton = document.getElementById('insert');
    insertButton.addEventListener('click', async () => {
        console.log('insert data')
        editor.blocks.insert("header", { text: "hello world" }, {}, 0, true)
    });

    const getIDButton = document.getElementById('getID');
    getIDButton.addEventListener('click', async () => {
        console.log('getID')
        const id = editor.blocks.getBlockByIndex(editor.blocks.getCurrentBlockIndex()).id
        //console.log(editor.blocks.getBlockByIndex(editor.blocks.getCurrentBlockIndex()))
        //console.log('id', editor.blocks.getById(id).call('setClickListener', controller));
        //console.log(controller.buttonAPI);
        controller.buttonAPI.setClickListener(editor, id);

        getBlockIndexByID(id).then((index) => {
            console.log('index', index)
        })
    });



    const argsInput = document.getElementById('args-input');
    let oldValue = argsInput.value; // 初始化旧值

    argsInput.addEventListener('input', function (event) {
        let newValue = event.target.value; // 获取新值
        let increment = ''; // 用来保存增量

        // 用户增加了内容
        increment = newValue.substring(oldValue.length);
        console.log(increment);
        if (increment === '{') {

            editor.save().then((outputData) => {
                console.log('args-input focus', outputData);
                //将outputData转换为menuData的形式
                console.log(transOutputToMenuData(outputData));

                // 清空menu容器中的内容
                const menuContainer = document.getElementById('menu');
                menuContainer.innerHTML = '';

                menuContainer.appendChild(createMenu(transOutputToMenuData(outputData)));
            });


        }
        oldValue = newValue;
    });
});






