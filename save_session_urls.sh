#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-

function firefox_save_session_urls () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"
  cd "$SELFPATH" || return $?
  [ -n "$HOSTNAME" ] || export HOSTNAME="$(hostname --short)"
  local DBGLV="${DEBUGLEVEL:-0}"

  local FF_PIDS="$(
    ps --no-headers -o pid -C firefox | grep -oPe '\d+' | sort --numeric-sort)"
  [ -n "$FF_PIDS" ] || return 0
  local FIRST_PID="${FF_PIDS%%$'\n'*}"
  FF_PIDS="${FF_PIDS//$'\n'/_}"
  local SAVE_DIR="$HOME/.cache/mozilla/session-urls"
  mkdir --parents -- "$SAVE_DIR" || return $?
  local SAVE_FILE=
  printf -v SAVE_FILE "%s/%(%y%m%d.%Hh)T.%s" "$SAVE_DIR" -1 "$FF_PIDS"

  local CUR_PROFILE="$(find /proc/"$FIRST_PID"/fd \
    -type l -lname '*/places.sqlite' \
    -xtype f -printf '%l\n' \
    2>/dev/null | head -n 1)"
    # ^-- mute because find sometimes reports an error "file not found",
    #     probably a race condition caused by firefox closing the fd
    #     while find checks it.
  CUR_PROFILE="$(dirname "$CUR_PROFILE")"
  local LZ4="$CUR_PROFILE"/sessionstore-backups/recovery.jsonlz4
  [ -f "$LZ4" ] || return 3$(
    echo "E: unable to detect session store backup file path" >&2)
  [ "$DBGLV" -ge 2 ] && echo "D: reading file $LZ4" >&2
  local PARSE=(
    "$SELFPATH"/cli.js
    # --closed
    --title
    --dump-full-json="$SAVE_DIR"/sessdata.json
    )
  local TABS="$(<"$LZ4" nodejs "${PARSE[@]}")"
  [ -n "$TABS" ] || return 8$(echo "E: found no tab URLs" >&2)
  echo "$TABS"
  <<<"$TABS" safe_save "$SAVE_FILE".urls .txt || return $?
  return $?
}


function safe_save () {
  local DEST="$1"; shift
  local FEXT="$1"; shift
  local TMPFN="$DEST.new-$$$FEXT.tmp"
  cat -- >"$TMPFN" || return $?
  [ ! -e "$DEST$FEXT" ] || mv --no-target-directory \
    -- "$DEST"{,.bak}"$FEXT" || return $?
  mv --no-target-directory -- "$TMPFN" "$DEST$FEXT" || return $?
  return 0
}







firefox_save_session_urls "$@"; exit $?
