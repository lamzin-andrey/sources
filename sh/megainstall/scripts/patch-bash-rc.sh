
# SSH Agent Environment file, .ssh/environment used for internal ssh purpose
SA_ENV="${HOME}/.ssh/agent.env"


function agent_is_running() {
    if [ "$SSH_AUTH_SOCK" ]
    then
        ssh-add -l &>/dev/null
        # 0 = agent running, has keys
        # 1 = agent running, no keys
        # 2 = agent not running
        if [ $? -lt 2 ]
        then
            true
        else
            false
        fi
    else
        false
    fi
}

function forgetknown(){
    line=$1
    if [ -n "$line" ]
    then
        sed ${line}d -i ~/.ssh/known_hosts
    else
        echo "Nothing to clean: no param"
    fi
}

function agent_has_keys() {
    if [ "$SSH_AUTH_SOCK" ]
    then
        ssh-add -l &>/dev/null

        if [ $? -eq 0 ]
        then
            true
        else
            false
        fi
    else
        false
    fi
}

function agent_load_env() {
    . "$SA_ENV" >/dev/null

    if [ ! -S "${HOME}/.ssh/ssh_auth_sock" ]
    then
        ln -sf "$SSH_AUTH_SOCK" ~/.ssh/ssh_auth_sock
    fi

    export SSH_AUTH_SOCK=~/.ssh/ssh_auth_sock
}

function agent_start() {
    (umask 077; ssh-agent > "$SA_ENV")
    agent_load_env
}

function has_private_keys() {
    find ${HOME}/.ssh/ -type f 2>/dev/null | grep -q .pub$
}

function add_all_keys() {
    for KEY in $(find ${HOME}/.ssh/ -type f | grep .pub$ | sed s/\.pub//g)
    do
        ssh-add -t 300 "$KEY"
    done
}

if ! agent_is_running
then
    agent_load_env
fi

if ! agent_is_running
then
    if has_private_keys
    then
        agent_start
        ssh-add
    fi
fi

if ! agent_has_keys
then
    echo "No SSH keys registered."
else
    echo "$(ssh-add -l | wc -l) SSH keys registered."
fi

unset SA_ENV
