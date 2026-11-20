# Repository Audit Guide

Inspect package manifests and lockfiles, server and client entry points, route/controller definitions, authentication and authorization, database ownership checks, environment variable usage, source-map and debug configuration, upload/export/search/bulk endpoints, CI permissions and deployment secrets.

Use exact file paths, line numbers and route names. Separate confirmed findings from hypotheses. Do not infer a vulnerability from a dependency name alone.

Fix authorization and secret exposure before adding bot heuristics or decoys. A decoy is not a mitigation for IDOR, broken access control or exposed credentials.
