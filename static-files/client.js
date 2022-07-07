'use strict'

function setupForList() {
    const gameDeleteButtons =
        document.querySelectorAll('.game-del-but')
    const groupDeleteButtons =
        document.querySelectorAll('.group-del-but')
    const groupEditButtons =
        document.querySelectorAll('.group-edit-but')
    gameDeleteButtons.forEach(butDel => {
        butDel.onclick = onDeleteGame
    })
    groupDeleteButtons.forEach(butDel => {
        butDel.onclick = onDeleteGroup
    })
    groupEditButtons.forEach(butDel => {
        butDel.onclick = onEditGroup
    })

    async function onDeleteGame() {
        const ids = this.id.substr(8).split("/")
        const groupID = ids[0]
        const gameID = ids[1]
        const userID = ids[2]


        try {
            await apiDeleteGame(groupID, gameID, userID)
            deleteTableEntry(gameID)
        } catch (err) {
            alert(err)
        }
    }

    async function apiDeleteGame(groupID, gameID, userID) {
        const delReqRes = await fetch(
            '/api/groups/' + groupID + '/games/' + gameID, {
                method: 'DELETE',
                headers: {
                    Authorization: userID
                }
            }
        )
        if (delReqRes.status === 204) {
            return
        }
        throw new Error(
            'Failed to delete game with id ' + gameID + '\n' +
            delReqRes.status + ' ' + delReqRes.statusText
        )
    }

    async function onDeleteGroup() {
        const ids = this.id.substr(8).split("/")
        const groupID = ids[0]
        const userID = ids[1]


        try {
            await apiDeleteGroup(groupID, userID)
            deleteTableEntry(groupID)
        } catch (err) {
            alert(err)
        }
    }

    async function apiDeleteGroup(groupID, userID) {
        const delReqRes = await fetch(
            '/api/groups/' + groupID, {
                method: 'DELETE',
                headers: {
                    Authorization: userID
                }
            }
        )
        if (delReqRes.status === 204) {
            return
        }
        throw new Error(
            'Failed to delete game with id ' + gameID + '\n' +
            delReqRes.status + ' ' + delReqRes.statusText
        )
    }

    async function onEditGroup() {
        const ids = this.id.substr(9).split("/")
        const groupID = ids[0]
        const userID = ids[1]
        const name = ids[2]
        const description = ids[3]


        try {
            await apiEditGroup(groupID, userID, name, description)
        } catch (err) {
            alert(err)
        }
    }

    async function apiEditGroup(groupID, userID, name, description) {
        const editReqRes = await fetch(
            '/api/groups/' + groupID, {
                method: 'PUT',
                headers: {
                    Authorization: 'Bearer ' + userID,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description
                })

            }
        )
        if (editReqRes.status === 204) {
            window.location.replace('/groups/' + groupID)
            return
        }
        throw new Error(
            'Failed to update group with id ' + groupID + '\n' +
            editReqRes.status + ' ' + editReqRes.statusText
        )
    }

    function deleteTableEntry(ID) {
        const tableEntryID = '#entry-' + ID
        const tableEntry = document.querySelector(tableEntryID)
        tableEntry.parentNode.removeChild(tableEntry)
    }
}
